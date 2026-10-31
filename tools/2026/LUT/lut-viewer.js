/* ============================================================
   lut-viewer.js — 看图浮层（大图 / 按住对比 / ↑↓ 换 LUT）
   ------------------------------------------------------------
   1. 只做「看」和「选」：把 app.js 已经算好的两张离屏画布
      （U = 应用 LUT，M = 原图）画进浮层，不参与任何色彩计算。
   2. 交互约定：
        · 点预览画面 → 浮层从点击处展开（transform-origin 锚在触发点）
        · 按住画面 → 立刻切到原图，松开回 LUT 效果
        · ↑ / ↓   → 切换 LUT，不退出浮层
        · Esc / 点空白 / 关闭按钮 → 关闭，焦点回到预览区
   3. 动效只做进出的缩放淡入，不做手势驱动动画；尊重
      prefers-reduced-motion（改为纯淡入淡出）。
   ============================================================ */

(function () {
    const tool = window.lutTool;
    const host = document.querySelector('lut-converter');
    const root = document.getElementById('lutViewer');
    if (!tool || !host || !root) return;

    const viewport = host.querySelector('.lut-viewport');
    const dialog = root.querySelector('.lut-viewer-dialog');
    const stage = root.querySelector('[data-viewer-stage]');
    const gradedCv = root.querySelector('[data-viewer-graded]');
    const originalCv = root.querySelector('[data-viewer-original]');
    const nameEl = root.querySelector('[data-viewer-name]');
    const dimsEl = root.querySelector('[data-viewer-dims]');
    const badge = root.querySelector('[data-viewer-badge]');
    const exportBtn = root.querySelector('[data-viewer-export]');
    const closeBtn = root.querySelector('[data-viewer-close]');

    if (!viewport || !stage || !gradedCv || !originalCv) return;

    let isOpen = false;
    let comparing = false;
    let lastFocus = null;
    let hideTimer = 0;
    let prevHtmlOverflow = '';
    let prevBodyOverflow = '';

    function drawTo(canvas, source) {
        if (!canvas || !source) return;
        if (canvas.width !== source.width) canvas.width = source.width;
        if (canvas.height !== source.height) canvas.height = source.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(source, 0, 0);
    }

    function paint() {
        const graded = tool.graded();
        if (!graded) return;

        drawTo(gradedCv, graded);
        drawTo(originalCv, tool.original());

        if (nameEl) nameEl.textContent = tool.lutName();
        if (dimsEl) {
            dimsEl.textContent = graded.width + ' × ' + graded.height +
                ' · ' + (tool.sourceType() === 'image/jpeg' ? 'JPEG' : 'PNG');
        }

        requestAnimationFrame(positionBadge);
    }

    // 「原图」角标贴图像实际显示的左上角，而不是舞台角落
    function positionBadge() {
        if (!badge) return;
        const image = gradedCv.getBoundingClientRect();
        const box = stage.getBoundingClientRect();
        if (!image.width) return;
        badge.style.left = (image.left - box.left + 12) + 'px';
        badge.style.top = (image.top - box.top + 12) + 'px';
    }

    function setCompare(on) {
        if (!isOpen || comparing === on) return;
        comparing = on;
        root.dataset.compare = on ? 'on' : 'off';
        if (badge) badge.hidden = !on;
    }

    function openViewer(point) {
        if (isOpen || !tool.graded()) return;

        isOpen = true;
        clearTimeout(hideTimer);

        const x = point && typeof point.x === 'number' ? point.x : window.innerWidth / 2;
        const y = point && typeof point.y === 'number' ? point.y : window.innerHeight / 2;
        root.style.setProperty('--ox', x + 'px');
        root.style.setProperty('--oy', y + 'px');

        paint();
        root.dataset.compare = 'off';
        if (badge) badge.hidden = true;

        root.hidden = false;
        // 先渲染一帧隐藏状态，再打开过渡
        void root.offsetWidth;
        root.classList.add('is-open');

        prevHtmlOverflow = document.documentElement.style.overflow;
        prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        lastFocus = document.activeElement;
        if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function closeViewer() {
        if (!isOpen) return;

        isOpen = false;
        setCompare(false);
        root.classList.remove('is-open');

        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;

        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (!isOpen) root.hidden = true;
        }, 300);

        const target = (lastFocus && lastFocus !== document.body && typeof lastFocus.focus === 'function')
            ? lastFocus
            : viewport;
        if (target) target.focus({ preventScroll: true });
    }

    function step(direction) {
        const rows = Array.prototype.slice.call(host.querySelectorAll('.lut-file'));
        if (rows.length < 2) return;

        let index = rows.findIndex((row) => row.classList.contains('selected'));
        if (index < 0) index = 0;

        const next = rows[Math.max(0, Math.min(rows.length - 1, index + direction))];
        if (!next || next === rows[index]) return;

        next.click();                 // 走 app.js 原有的选中逻辑
        paint();                      // 同步浮层里的 LUT 名与画面
        next.scrollIntoView({ block: 'nearest' });
    }

    // ---------- 入口 ----------
    viewport.addEventListener('click', (event) => {
        openViewer({ x: event.clientX, y: event.clientY });
    });

    viewport.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openViewer();
        }
    });

    // ---------- 关闭 ----------
    if (closeBtn) closeBtn.addEventListener('click', closeViewer);
    stage.addEventListener('click', (event) => {
        if (event.target === stage) closeViewer();
    });

    // ---------- 按住对比（按下即切换，不等抬起） ----------
    stage.addEventListener('pointerdown', (event) => {
        if (!event.target.classList || !event.target.classList.contains('lut-viewer-canvas')) return;
        event.preventDefault();
        setCompare(true);
        try {
            if (stage.setPointerCapture) stage.setPointerCapture(event.pointerId);
        } catch (error) { /* 合成事件没有活跃指针，忽略即可 */ }
    });
    stage.addEventListener('pointerup', () => setCompare(false));
    stage.addEventListener('pointercancel', () => setCompare(false));
    stage.addEventListener('contextmenu', (event) => event.preventDefault());

    // ---------- 键盘 ----------
    document.addEventListener('keydown', (event) => {
        if (!isOpen) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeViewer();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            step(event.key === 'ArrowDown' ? 1 : -1);
        } else if (event.key === '\\') {
            event.preventDefault();
            setCompare(true);
        } else if (event.key === 'Tab') {
            const items = [exportBtn, closeBtn].filter(Boolean);
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        if (isOpen && event.key === '\\') setCompare(false);
    });

    if (exportBtn) {
        exportBtn.addEventListener('click', () => tool.exportImage(exportBtn));
    }

    // LUT 变化、窗口尺寸变化都会让 app.js 重绘，浮层跟着刷新
    tool.onRender(() => {
        if (isOpen) paint();
    });

    // 图注：点击空白处关闭的提示不必写死，交给底部说明
    if (dialog) dialog.setAttribute('aria-describedby', 'lutViewerHints');
})();
