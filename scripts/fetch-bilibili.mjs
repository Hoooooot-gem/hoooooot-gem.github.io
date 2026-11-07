/* ============================================================
   scripts/fetch-bilibili.mjs
   ------------------------------------------------------------
   定时快照脚本：抓一次最新投稿，写进 data/videos.json。
   由 .github/workflows/bilibili-snapshot.yml 每小时调用。

   为什么要有快照：
     Worker 是实时数据源，但它可能挂、可能被 B 站风控、
     可能免费额度用尽。快照是最后一层保险 —— 即使 Worker
     全线不可用，首页至少还能显示上一次成功抓到的内容。

   写盘策略：
     抓取失败时保留旧文件不覆盖。宁可数据旧一点，也不能因为
     一次网络抖动把兜底数据清空。

   用法：
     node scripts/fetch-bilibili.mjs
     node scripts/fetch-bilibili.mjs --mid 3707026240702873 --limit 6
   ============================================================ */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchLatestVideos } from '../worker/src/bilibili.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'data/videos.json');
const DEFAULT_MID = '3707026240702873';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const mid = arg('mid', process.env.BILI_MID || DEFAULT_MID);
  const limit = Number(arg('limit', 6));

  console.log(`[snapshot] 抓取 mid=${mid} limit=${limit}`);
  const t0 = Date.now();
  const result = await fetchLatestVideos({ mid, limit });
  console.log(`[snapshot] 耗时 ${Date.now() - t0}ms | ok=${result.ok} | 条数=${result.videos.length}`);

  if (!result.ok) {
    const prev = await readExisting();
    console.warn(`[snapshot] 抓取失败：${result.error}`);
    if (prev?.videos?.length) {
      console.warn(`[snapshot] 保留上一次快照（${prev.updatedAt}，${prev.videos.length} 条），不覆盖`);
    } else {
      console.warn('[snapshot] 本地暂无可用快照，data/videos.json 保持原样');
    }
    // 不用非 0 退出码：定时任务因风控失败是预期内的事，
    // 标红会让真正的代码问题淹没在噪音里。
    return;
  }

  const payload = {
    ok: true,
    mid: String(mid),
    source: 'snapshot',
    updatedAt: result.updatedAt,
    videos: result.videos
  };

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`[snapshot] 已写入 ${OUTPUT}（${result.videos.length} 条）`);

  if (result.videos.length && result.videos.length < limit) {
    console.warn(`[snapshot] 注意：公开投稿只有 ${result.videos.length} 条，不足 ${limit} 条，前端按实际条数渲染`);
  }
  if (!result.videos.length) {
    console.warn('[snapshot] 该账号当前没有公开投稿，前端会显示占位提示');
  }
}

main().catch(err => {
  console.error('[snapshot] 未预期错误：', err);
  process.exitCode = 1;
});
