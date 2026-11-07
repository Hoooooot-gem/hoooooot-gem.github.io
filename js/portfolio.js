/* ============================================================
   js/portfolio.js
   首页「作品集」板块：拉取 B 站最新投稿并渲染成卡片网格
   ------------------------------------------------------------
   数据来源与降级（任一环节失败都不影响页面其余部分）：
     1. 快照   —— data/videos.json，GitHub Actions 每小时刷新一次。
                  抓取失败时脚本会保留旧文件，所以这里拿到的不会是空。
     2. 实时   —— 可选。填了 LIVE_ENDPOINT 才会请求 Cloudflare Worker，
                  能连上就用最新数据覆盖快照。默认关闭：
                  workers.dev 在中国大陆被 DNS 污染，开了只是白挂 4 秒。
     3. 空态   —— 两条路都没有内容，或账号确实没有公开投稿，
                  显示一句提示 + 通往 B 站空间的按钮。

   判定细节：
     · 快照先上屏，内容立刻可见，用户不用对着骨架等；
     · 实时接口返回 ok:true 即为可信结论，哪怕 videos 为空
       （账号真没有投稿），此时清掉快照里的旧内容；
     · 条数不足 6 条时按实际条数渲染，网格自动收口，不补空位。

   数据字段见 worker/README.md。
   ============================================================ */

'use strict';

(function () {
    /* ==================== 配置 ====================
       纯快照模式：数据来自 data/videos.json，由 GitHub Actions 定时刷新。
       Worker 已部署但默认不启用 —— workers.dev 在中国大陆被 DNS 污染，
       开了只会让每次打开首页都挂一个必然失败的请求。想启用就填回地址：
       'https://hoooooot-bili-proxy.hoooooot-gem.workers.dev' */
    const LIVE_ENDPOINT = '';

    const SNAPSHOT_URL = '/data/videos.json';
    const LIMIT = 6;
    // 实时接口的超时。纯快照模式下用不到，保留给启用 Worker 的场景。
    const TIMEOUT = 4000;

    const grid = document.getElementById('video-grid');
    const emptyBox = document.getElementById('video-empty');
    if (!grid) return;

    /* ==================== 工具函数 ==================== */

    async function fetchJSON(url) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
        try {
            const res = await fetch(url, {
                // no-store：明确要求每次都回源，不复用任何缓存
                cache: 'no-store',
                credentials: 'omit',
                signal: ctrl.signal
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return await res.json();
        } finally {
            clearTimeout(timer);
        }
    }

    /* ==================== 渲染 ==================== */

    function buildCard(v) {
        const li = document.createElement('li');
        li.className = 'video-card';

        const a = document.createElement('a');
        a.className = 'video-link';
        a.href = v.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        // 读屏时给出完整语义，视觉上标题已可见，不重复朗读
        a.setAttribute('aria-label', v.title + '（B 站在新窗口打开）');

        const thumb = document.createElement('span');
        thumb.className = 'video-thumb';

        const img = document.createElement('img');
        img.src = v.coverThumb || v.cover || '';
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        // B 站图床对部分来源校验 Referer，去掉它反而更稳
        img.referrerPolicy = 'no-referrer';
        img.addEventListener('error', function () {
            // 缩放参数不被支持时退回原图，只回退一次，避免死循环
            if (img.dataset.fallback === '1' || !v.cover) return;
            img.dataset.fallback = '1';
            img.src = v.cover;
        });
        thumb.appendChild(img);

        if (v.duration) {
            const dur = document.createElement('span');
            dur.className = 'video-duration';
            dur.textContent = v.duration;
            thumb.appendChild(dur);
        }

        const title = document.createElement('h3');
        title.className = 'video-title';
        // 用 textContent 而非 innerHTML：视频标题完全来自外部接口
        title.textContent = v.title;

        a.append(thumb, title);
        li.appendChild(a);
        return li;
    }

    function renderVideos(videos) {
        const frag = document.createDocumentFragment();
        videos.slice(0, LIMIT).forEach(function (v) {
            if (v && v.url && v.title) frag.appendChild(buildCard(v));
        });

        if (!frag.childNodes.length) {
            showEmpty();
            return;
        }

        grid.replaceChildren(frag);
        grid.hidden = false;
        grid.setAttribute('aria-busy', 'false');
        if (emptyBox) emptyBox.hidden = true;
    }

    function showEmpty() {
        // 骨架留着不动会是六块灰条，必须清掉
        grid.replaceChildren();
        grid.hidden = true;
        grid.setAttribute('aria-busy', 'false');
        if (emptyBox) emptyBox.hidden = false;
    }

    /* ==================== 数据获取 ==================== */

    async function loadVideos() {
        let shown = false;

        // 1. 快照优先上屏。
        //    原因：workers.dev 在中国大陆解析被污染，实时接口对国内访客必然超时。
        //    先渲染快照，内容立刻可见，不会让国内用户对着骨架等 4 秒。
        try {
            // 加时间戳绕开 GitHub Pages 的 CDN 缓存，否则最多会旧 10 分钟
            const snap = await fetchJSON(SNAPSHOT_URL + '?t=' + Date.now());
            if (snap && snap.ok && Array.isArray(snap.videos) && snap.videos.length) {
                renderVideos(snap.videos);
                shown = true;
            }
        } catch (err) {
            console.warn('[portfolio] 快照不可用：', err.message);
        }

        // 2. 实时覆盖。能连上说明网络可达，用最新数据替换快照。
        if (LIVE_ENDPOINT) {
            try {
                const live = await fetchJSON(LIVE_ENDPOINT + '/videos?limit=' + LIMIT);
                if (live && live.ok && Array.isArray(live.videos)) {
                    // 实时成功即为权威结论：有数据就换成最新的，
                    // 没数据说明账号确实没有公开投稿，此时清掉快照里的旧内容
                    if (live.videos.length) renderVideos(live.videos);
                    else showEmpty();
                    return;
                }
                console.warn('[portfolio] 实时接口返回失败：', live && live.error);
            } catch (err) {
                console.warn('[portfolio] 实时接口不可达，保留快照：', err.message);
            }
        }

        // 3. 两条路都没给出内容，落到空态
        if (!shown) showEmpty();
    }

    /* ==================== 启动 ==================== */

    loadVideos();

    // 从往返缓存恢复时页面不会重新执行脚本，这里补一次拉取，
    // 保证「回到首页」看到的也是最新投稿
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) loadVideos();
    });
})();
