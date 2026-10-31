/* ============================================================
   preview-export.js — 预览图导出 · 载入失败提示 · 渲染状态广播
   ------------------------------------------------------------
   1. 不参与色彩计算。app.js 每次重绘都会把结果写进两块离屏画布：
        this.U  已应用 LUT（2D 上下文，尺寸 = 原图）
        this.M  未经处理的原图
      这里只读取这两块画布，按原分辨率导出，因此拿到的是完整画质，
      不是屏幕上的缩略图，也不含四宫格里的贴图与曲线。
   2. 不改 app.js 一行代码：只包装原型上的 k()（唯一重绘出口）与
      $()（单个 LUT 的解析入口），前者广播渲染完成，后者把失败
      转成界面上看得见的一行提示。
   3. 导出格式跟随源图：JPEG 进 → JPEG 0.92，PNG 进 → PNG（保留
      透明）。不额外增加格式选择控件。
   4. 供 lut-viewer.js 使用的接口挂在 window.lutTool 上。
   ============================================================ */

(function () {
    const host = document.querySelector('lut-converter');
    if (!host) return;

    const stageBtn = host.querySelector('[data-action="export-preview"]');
    const imgLoader = host.querySelector('[ref="$imgLoader"]');
    const alertEl = document.getElementById('lutAlert');
    const live = document.getElementById('lutLive');

    const listeners = [];
    let sourceName = '';
    let sourceType = 'image/jpeg';   // 默认示例图为 JPG
    let exporting = false;
    let alertTimer = 0;

    const graded = () => (host.U && host.U.canvas) || null;
    const original = () => (host.M && host.M.canvas) || null;
    const lutName = () => (host.C && host.C._name) || 'LUT';
    const isJpeg = () => sourceType === 'image/jpeg';

    function sync() {
        const canvas = graded();
        if (!stageBtn) return;
        stageBtn.disabled = !canvas;
        stageBtn.title = canvas
            ? '导出 ' + (isJpeg() ? 'JPEG' : 'PNG') + '（' + canvas.width + ' × ' + canvas.height + '，跟随原图）'
            : '载入图像后可导出';
    }

    function reportError(text) {
        if (!alertEl) return;
        alertEl.textContent = text;
        alertEl.hidden = false;
        clearTimeout(alertTimer);
        alertTimer = setTimeout(() => { alertEl.hidden = true; }, 6000);
    }

    function clearError() {
        if (!alertEl || alertEl.hidden) return;
        clearTimeout(alertTimer);
        alertEl.hidden = true;
    }

    function safeName(text) {
        const name = String(text || '').replace(/[\\/:*?"<>|]+/g, '-').trim();
        return name || 'preview';
    }

    function download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
        // 留出浏览器接管下载的时间再回收
        setTimeout(() => URL.revokeObjectURL(url), 30000);
    }

    // 完成反馈：按钮短暂变白底黑字的「已导出」，不弹浮层、不打断操作
    function flash(btn, width, height, jpeg) {
        if (!btn) return;
        const label = btn.querySelector('span');
        if (label && !btn.dataset.label) btn.dataset.label = label.textContent;
        if (label) label.textContent = '已导出';
        btn.classList.add('is-done');
        clearTimeout(btn._doneTimer);
        btn._doneTimer = setTimeout(() => {
            btn.classList.remove('is-done');
            if (label && btn.dataset.label) label.textContent = btn.dataset.label;
        }, 1500);
        if (live) {
            live.textContent = '已导出 ' + width + ' × ' + height + ' ' + (jpeg ? 'JPEG' : 'PNG');
        }
    }

    function exportImage(btn) {
        const canvas = graded();
        if (!canvas || exporting) return;

        const jpeg = isJpeg();
        const filename = safeName(sourceName) + ' - ' + safeName(lutName()) + (jpeg ? '.jpg' : '.png');

        exporting = true;
        try {
            canvas.toBlob((blob) => {
                exporting = false;
                if (!blob) {
                    reportError('导出失败：图像无法编码，请重试');
                    return;
                }
                download(blob, filename);
                flash(btn, canvas.width, canvas.height, jpeg);
            }, jpeg ? 'image/jpeg' : 'image/png', jpeg ? 0.92 : undefined);
        } catch (error) {
            exporting = false;
            reportError('导出失败：图像无法编码，请重试');
        }
    }

    // 记录用户选择的图片：文件名进导出命名，MIME 决定导出格式
    if (imgLoader) {
        imgLoader.addEventListener('change', () => {
            const file = imgLoader.files && imgLoader.files[0];
            if (!file) return;
            sourceName = file.name.replace(/\.[^.]+$/, '');
            sourceType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
            clearError();
            sync();
        });
    }

    if (stageBtn) {
        stageBtn.addEventListener('click', () => exportImage(stageBtn));
    }

    const ctor = customElements.get('lut-converter');
    const proto = ctor && ctor.prototype;

    // 单个 LUT 解析失败时给出可读原因（app.js 原本只抛 Promise 拒绝）
    if (proto && typeof proto.$ === 'function') {
        const parse = proto.$;
        proto.$ = function (file) {
            const promise = parse.call(this, file);
            if (promise && typeof promise.then === 'function') {
                promise.then((row) => {
                    // 没有 TITLE 的 .cube 会让 LUT 导出文件名变成 " - converted with ..."，
                    // 这里用文件名兜底，导出与预览的命名保持一致
                    if (row && row._lut && !row._lut.title) {
                        row._lut.title = row._name || 'LUT';
                    }
                    clearError();
                }, (error) => {
                    const name = (file && file.name) || 'LUT';
                    const looksCube = /\.cube$/i.test(name) || /cube/i.test(String(error && error.message));
                    reportError(looksCube
                        ? '无法读取 ' + name + '：不是有效的 .cube 文件'
                        : '无法识别 ' + name + '：请选择 LUT 贴图 PNG 或 .cube 文件');
                });
            }
            return promise;
        };
    }

    // 每次重绘后同步按钮状态，并通知订阅者（看图浮层）
    if (proto && typeof proto.k === 'function') {
        const render = proto.k;
        proto.k = function () {
            const result = render.apply(this, arguments);
            sync();
            for (let i = 0; i < listeners.length; i++) {
                try { listeners[i](); } catch (error) { /* 订阅者异常不影响绘制 */ }
            }
            return result;
        };
    }

    // 首帧的 k() 在脚本执行前已经跑过，这里补一次初始状态
    sync();

    // 解析失败时 app.js 会产生未处理的 Promise 拒绝；原因已知且界面已提示，
    // 这里只静音这两类重复报错，其他异常照常暴露。
    window.addEventListener('unhandledrejection', (event) => {
        const message = String((event.reason && event.reason.message) || '');
        if (/Invalid cube file|Unsupported format/i.test(message)) event.preventDefault();
    });

    window.lutTool = {
        graded,
        original,
        lutName,
        exportImage,
        reportError,
        sourceType: () => sourceType,
        onRender: (fn) => { if (typeof fn === 'function') listeners.push(fn); }
    };
})();
