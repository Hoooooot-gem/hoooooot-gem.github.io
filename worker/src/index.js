/* ============================================================
   worker/src/index.js — B 站投稿代理
   ------------------------------------------------------------
   对外只暴露一个只读接口：GET /videos
   返回结构与站点内 data/videos.json 完全一致，前端可以用
   同一套解析逻辑处理「实时」与「快照」两种来源。

   设计取舍：
     · 不做响应缓存 —— 用户要求每次打开首页都取最新，缓存会让
       新投稿延迟出现。代价是每次都要真打一次 B 站接口，
       个人站点量级完全够用。
     · 只允许配置里的 mid —— 否则这个域名会变成一个通用的
       B 站代理，容易被滥用打爆免费额度。
     · 失败也返回 200 + ok:false，让前端走降级分支，
       而不是抛 5xx 让浏览器报错。
   ============================================================ */

import { fetchLatestVideos } from './bilibili.js';

const DEFAULT_MID = '3707026240702873';
const DEFAULT_ORIGINS = [
  'https://hoooooot-gem.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function parseOrigins(env) {
  if (!env.ALLOWED_ORIGINS) return DEFAULT_ORIGINS;
  return env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
}

function corsHeaders(origin, allowed) {
  const h = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
  // 仅回显白名单内的来源；不在名单里就不下发 CORS 头，浏览器自然拦截
  if (origin && allowed.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 明确告诉浏览器和中间层都不要缓存
      'Cache-Control': 'no-store, max-age=0',
      ...extraHeaders
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = parseOrigins(env);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'GET') {
      return json({ ok: false, error: '仅支持 GET' }, 405, cors);
    }

    const mid = env.BILI_MID || DEFAULT_MID;
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 6, 1), 12);
    // 参数化 mid 只用来调试，正式站固定读环境变量，防止被当成公共代理
    const requested = url.searchParams.get('mid');
    if (requested && requested !== mid) {
      return json({ ok: false, error: '该 UP 主不在允许列表内' }, 403, cors);
    }

    try {
      const result = await fetchLatestVideos({ mid, limit });
      return json(
        { ok: result.ok, mid, limit, source: 'live', updatedAt: result.updatedAt, videos: result.videos, error: result.error },
        200,
        cors
      );
    } catch (e) {
      return json(
        { ok: false, mid, limit, source: 'live', updatedAt: new Date().toISOString(), videos: [], error: e.message || String(e) },
        200,
        cors
      );
    }
  }
};
