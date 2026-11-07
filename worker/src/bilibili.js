/* ============================================================
   worker/src/bilibili.js
   ------------------------------------------------------------
   与运行时无关的 B 站投稿抓取模块。
   同一份代码被两处复用：
     · Cloudflare Worker（worker/src/index.js）
     · GitHub Actions 快照脚本（scripts/fetch-bilibili.mjs）
   因此只依赖标准 Web API：fetch / TextEncoder / DataView，
   不引用 node:* 也不引用 Workers 专有绑定。

   为什么不能前端直连：
     1. api.bilibili.com 不返回 CORS 头，浏览器侧读不到响应；
     2. 投稿列表接口强制 WBI 签名 + buvid cookie，缺一即 412。

   风控要点（2026-11 实测）：
     · 必须有 buvid3 / buvid4 cookie，spi 接口下发；
     · 必须带 dm_img_* 四个参数，缺失会回 412；
     · 必须凑齐 sec-ch-ua / sec-fetch-* 一类浏览器指纹头；
     · wbi key 会轮换，需定期重新读取 nav 接口。
   ============================================================ */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const MIXIN_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
];

/* ---------------- 1. MD5（Web Crypto 不支持 MD5，自实现） ---------------- */

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];

const K = new Uint32Array(64);
for (let i = 0; i < 64; i++) {
  K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
}

const add32 = (a, b) => (a + b) >>> 0;
const rotl = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;

export function md5(input) {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const total = ((bytes.length + 8) >> 6) * 64 + 64;

  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[bytes.length] = 0x80;

  const dv = new DataView(buf.buffer);
  dv.setUint32(total - 8, bitLen >>> 0, true);
  dv.setUint32(total - 4, Math.floor(bitLen / 4294967296) >>> 0, true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const M = new Uint32Array(16);

  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(off + i * 4, true);

    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }

      const tmp = D;
      D = C;
      C = B;
      B = add32(B, rotl(add32(add32(A, F), add32(K[i], M[g])), S[i]));
      A = tmp;
    }
    a0 = add32(a0, A); b0 = add32(b0, B);
    c0 = add32(c0, C); d0 = add32(d0, D);
  }

  const out = new Uint8Array(16);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, a0, true);
  odv.setUint32(4, b0, true);
  odv.setUint32(8, c0, true);
  odv.setUint32(12, d0, true);
  return Array.from(out, b => b.toString(16).padStart(2, '0')).join('');
}

/* ---------------- 2. WBI 签名 ---------------- */

const mixinKey = raw => MIXIN_TAB.map(i => raw[i]).join('').slice(0, 32);

function signParams(params, key) {
  const query = Object.keys(params)
    .sort()
    .map(k => {
      const v = String(params[k]).replace(/[!'()*]/g, '');
      return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    })
    .join('&');
  return `${query}&w_rid=${md5(query + key)}`;
}

/* ---------------- 3. 会话：buvid cookie + wbi key ---------------- */

const SESSION_TTL = 5 * 60 * 1000;
let session = { cookie: '', key: '', at: 0 };

class CookieJar {
  constructor() { this.map = new Map(); }
  absorb(headers) {
    const list = headers.getSetCookie ? headers.getSetCookie() : [];
    for (const line of list) {
      const pair = line.split(';')[0];
      const i = pair.indexOf('=');
      if (i > 0) this.map.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
  }
  set(k, v) { if (v) this.map.set(k, v); }
  toString() { return [...this.map].map(([k, v]) => `${k}=${v}`).join('; '); }
}

async function buildSession() {
  const jar = new CookieJar();
  const base = {
    'User-Agent': UA,
    Referer: 'https://www.bilibili.com/',
    Accept: 'application/json, text/plain, */*'
  };

  // 首页热身：拿到初始 buvid3 与 b_nut，否则后续接口一律 412
  try {
    const warm = await fetch('https://www.bilibili.com/', {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' }
    });
    jar.absorb(warm.headers);
  } catch { /* 热身失败仍可继续，spi 会补发 buvid */ }

  try {
    const spi = await fetch('https://api.bilibili.com/x/frontend/finger/spi', {
      headers: { ...base, Cookie: jar.toString() }
    });
    jar.absorb(spi.headers);
    const j = await spi.json();
    jar.set('buvid3', j?.data?.b_3);
    jar.set('buvid4', j?.data?.b_4);
  } catch { /* 忽略：缺 buvid 会在后续请求暴露为 412 */ }

  jar.set('b_nut', String(Math.floor(Date.now() / 1000)));

  const nav = await fetch('https://api.bilibili.com/x/web-interface/nav', {
    headers: { ...base, Cookie: jar.toString() }
  });
  jar.absorb(nav.headers);
  const navJson = await nav.json();
  const img = navJson?.data?.wbi_img?.img_url || '';
  const sub = navJson?.data?.wbi_img?.sub_url || '';
  const raw = img.split('/').pop().split('.')[0] + sub.split('/').pop().split('.')[0];
  if (raw.length !== 64) throw new Error('WBI key 获取失败');

  return { cookie: jar.toString(), key: mixinKey(raw) };
}

async function getSession(force = false) {
  if (!force && session.key && Date.now() - session.at < SESSION_TTL) return session;
  const fresh = await buildSession();
  session = { ...fresh, at: Date.now() };
  return session;
}

/* ---------------- 4. 投稿列表 ---------------- */

// 2023 年底起接口要求的三组环境参数，缺失即被判定为机器请求
const DM_PARAMS = {
  dm_img_list: '[]',
  dm_img_str: 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ',
  dm_cover_img_str:
    'QU5HTEUgKE5WSURJQSwgTlZJRElBIEdlRm9yY2UgR1RYIDEwNjAgNkdCIERpcmVjdDNEMTEpR29vZ2xlIEluYy4gKE5WSURJQS',
  dm_img_inter: '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}'
};

async function requestList(mid, limit, sess) {
  const params = {
    mid: String(mid),
    ps: String(Math.min(Math.max(limit, 1), 30)),
    pn: '1',
    order: 'pubdate',
    platform: 'web',
    web_location: '1550101',
    ...DM_PARAMS,
    wts: String(Math.floor(Date.now() / 1000))
  };

  const url = `https://api.bilibili.com/x/space/wbi/arc/search?${signParams(params, sess.key)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: `https://space.bilibili.com/${mid}/video`,
      Origin: 'https://space.bilibili.com',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      Cookie: sess.cookie
    }
  });

  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 412 时返回的是 HTML */ }
  return { status: res.status, json };
}

/* ---------------- 5. 归一化输出 ---------------- */

function normalize(v) {
  const pic = String(v.pic || '');
  // 接口有时返回 http:// 或 // 开头，HTTPS 站点直接引用会被混合内容策略拦截，统一升到 https
  let cover = pic;
  if (cover.startsWith('//')) cover = `https:${cover}`;
  cover = cover.replace(/^http:\/\//, 'https://');

  return {
    bvid: v.bvid || '',
    title: String(v.title || '').replace(/<[^>]+>/g, ''),
    cover,
    // B 站 CDN 支持在文件名后追加缩放参数，卡片只显示封面小图，用不着原图
    coverThumb: cover ? `${cover}@480w_270h_1c` : '',
    // 原视频地址固定用 bvid 拼接，避免依赖接口里可能缺失的字段
    url: v.bvid ? `https://www.bilibili.com/video/${v.bvid}` : '',
    pubdate: Number(v.created) || 0,
    duration: String(v.length || ''),
    views: Number(v.play) || 0
  };
}

/**
 * 抓取指定 UP 主最新投稿。
 * @param {object} opts
 * @param {string|number} opts.mid   UP 主 UID
 * @param {number} [opts.limit=6]    需要的条数
 * @returns {Promise<{ok:boolean,videos:Array,updatedAt:string,error?:string}>}
 *          注意：ok 为 true 但 videos 为空，表示账号确实没有公开投稿，
 *          与抓取失败（ok 为 false）是两种不同情况，调用方需分别处理。
 */
export async function fetchLatestVideos({ mid, limit = 6 }) {
  if (!mid) throw new Error('缺少 mid');

  let lastErr = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const sess = await getSession(attempt > 0);
      const { status, json } = await requestList(mid, limit, sess);

      // 412 = 风控拦截，换一套新 cookie 重签再试
      if (status === 412 || json?.code === -412) {
        lastErr = '风控拦截 (412)';
        continue;
      }
      if (json?.code === -352) { lastErr = '风控校验失败 (-352)'; continue; }
      if (json?.code !== 0) {
        lastErr = json?.message || `接口返回 code=${json?.code ?? '未知'}`;
        continue;
      }

      const list = json?.data?.list?.vlist || [];
      return {
        ok: true,
        videos: list.slice(0, limit).map(normalize),
        updatedAt: new Date().toISOString()
      };
    } catch (e) {
      lastErr = e.message || String(e);
    }
  }

  return { ok: false, videos: [], updatedAt: new Date().toISOString(), error: lastErr };
}
