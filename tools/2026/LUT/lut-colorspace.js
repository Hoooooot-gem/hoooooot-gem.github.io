/* ============================================================
   lut-colorspace.js — 导入前的 LUT 色彩空间识别与确认
   ------------------------------------------------------------
   1. 识别依据只有文件自带的元数据，不做像素级反推：
        · .cube  → TITLE / # 注释 / DOMAIN_* 行（读前 256KB 足够）
        · .png   → tEXt / iTXt 文本块（读前 512KB 足够）
        · 元数据没写时，退回文件名里的转换关系（SLog3_to_Rec709、BT2020…）
      3D LUT 的数值恒为 0–1，仅凭采样值无法可靠区分 Rec.709 与
      Rec.2020；任何"看数据判断"的做法都是猜，这里不猜。
   2. 判定为四种结果：Rec.709、Rec.2020、其他已知空间、
      无法确定（未标注 / 同时提到多个空间）。
   3. 未标注默认按 Rec.709 放行——绝大多数 .cube 不带任何色彩
      空间声明，一律弹窗会变成"每次导入都确认"。需要严格模式时
      把 STRICT_UNKNOWN 改成 true 即可。
   4. 流程衔接：在 capture 阶段拦下 change（早于 app.js 的解析），
      选「否」清空 input、不触发任何后续步骤；选「是」或无需确认
      时，用带 bypass 标记的合成 change 交还给原导入流程。
   ============================================================ */

(function () {
    const STRICT_UNKNOWN = false;   // true = 未标注也弹窗

    const host = document.querySelector('lut-converter');
    const input = host && host.querySelector('[ref="$fileLoader"]');
    const dialog = document.getElementById('lutConfirm');
    if (!host || !input || !dialog) return;

    const listEl = dialog.querySelector('[data-confirm-list]');
    const yesBtn = dialog.querySelector('[data-confirm-yes]');
    const noBtn = dialog.querySelector('[data-confirm-no]');

    // ---------- 色彩空间词表 ----------

    const SPACES = [
        { id: 'rec2020', label: 'Rec.2020', re: /\b(?:rec|bt)[\s._-]*2020\b/i },
        { id: 'rec709', label: 'Rec.709', re: /\b(?:rec|bt)[\s._-]*709\b|\bsrgb\b/i },
        { id: 'p3', label: 'DCI-P3 / Display P3', re: /\b(?:dci[\s._-]*p3|display[\s._-]*p3|p3[\s._-]*d65)\b/i },
        { id: 'aces', label: 'ACES', re: /\baces(?:cg|2065)?\b/i },
        { id: 'log', label: 'Log（LogC / S-Log / V-Log）', re: /\barri[\s._-]*logc\b|\blogc\b|\bs[\s._-]*log[\s._-]*[23]?\b|\bv[\s._-]*log\b|\blog[\s._-]*[23]\b/i },
        { id: 'adobe', label: 'Adobe RGB', re: /\badobe[\s._-]*rgb\b/i },
        { id: 'prophoto', label: 'ProPhoto RGB', re: /\bprophoto\b/i }
    ];

    const TOKEN = '(?:rec[\\s._-]*2020|bt[\\s._-]*2020|rec[\\s._-]*709|bt[\\s._-]*709|dci[\\s._-]*p3|display[\\s._-]*p3|acescg|aces|logc|s[\\s._-]*log[\\s._-]*3|v[\\s._-]*log)';
    const TRANSFORM = new RegExp('(' + TOKEN + ')[\\s._-]*(?:->|→|to|2)[\\s._-]*(' + TOKEN + ')', 'i');

    function hitsIn(text) {
        if (!text) return [];
        return SPACES.filter((space) => space.re.test(text));
    }

    function matchToken(text) {
        return SPACES.find((space) => space.re.test(text)) || null;
    }

    // .cube 只扫头部：注释、TITLE、尺寸与域声明，遇到第一条数据即停
    function cubeHeader(text) {
        const out = [];
        for (const raw of text.split(/\r?\n/)) {
            const line = raw.trim();
            if (!line) continue;
            if (line.charAt(0) === '#' || /^(TITLE|LUT_1D_SIZE|LUT_3D_SIZE|LUT_1D_INPUT_RANGE|LUT_3D_INPUT_RANGE|DOMAIN_MIN|DOMAIN_MAX)\b/i.test(line)) {
                out.push(line);
                continue;
            }
            if (/^[-+]?[\d.]/.test(line)) break;
        }
        return out.join('\n');
    }

    function classify(text, isCube) {
        const scope = isCube ? cubeHeader(text || '') : (text || '');
        if (!scope) return { id: 'unknown', label: '未标注' };

        if (isCube) {
            const min = scope.match(/DOMAIN_MIN\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/i);
            const max = scope.match(/DOMAIN_MAX\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/i);
            if (min && max) {
                const values = min.slice(1).concat(max.slice(1)).map(Number);
                if (values.some((v) => v < -0.001 || v > 1.001)) {
                    return { id: 'domain', label: '扩展输入域（非 0–1）' };
                }
            }
        }

        // 1) 显式的 input / source 声明优先级最高
        const declared = scope.split(/\r?\n/).find((line) => /(input|source|from)\b[^:=\n]{0,24}[:=]/i.test(line));
        if (declared) {
            const hits = hitsIn(declared);
            if (hits.length === 1) return { id: hits[0].id, label: hits[0].label };
        }

        // 2) A to B / A -> B / A→B：取箭头左侧作为输入空间
        const transform = scope.match(TRANSFORM);
        if (transform) {
            const left = matchToken(transform[1]);
            if (left) return { id: left.id, label: left.label };
        }

        // 3) 整段元数据里只出现一种空间
        const hits = hitsIn(scope);
        if (hits.length === 1) return { id: hits[0].id, label: hits[0].label };
        if (hits.length > 1) {
            return { id: 'ambiguous', label: '无法确定（同时提到 ' + hits.map((h) => h.label).join(' / ') + '）' };
        }
        return { id: 'unknown', label: '未标注' };
    }

    // ---------- PNG 文本块 ----------

    function readPngText(buffer) {
        const bytes = new Uint8Array(buffer);
        const signature = [137, 80, 78, 71, 13, 10, 26, 10];
        if (bytes.length < 8) return '';
        for (let i = 0; i < 8; i++) if (bytes[i] !== signature[i]) return '';

        const decoder = new TextDecoder('latin1');
        const chunks = [];
        let offset = 8;

        while (offset + 8 <= bytes.length) {
            const length = ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
            const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
            const start = offset + 8;
            if (start + length > bytes.length) break;
            if (type === 'tEXt' || type === 'iTXt') {
                chunks.push(decoder.decode(bytes.subarray(start, start + length)).replace(/\0/g, ' '));
            }
            if (type === 'IEND') break;
            offset = start + length + 4;
        }
        return chunks.join('\n');
    }

    // ---------- 逐个文件判定 ----------

    async function inspectFile(file) {
        let info = { id: 'unknown', label: '未标注' };
        try {
            if (/\.cube$/i.test(file.name)) {
                const text = await file.slice(0, 262144).text();
                info = classify(text, true);
            } else if (/\.png$/i.test(file.name)) {
                const text = readPngText(await file.slice(0, 524288).arrayBuffer());
                info = classify(text, false);
            }
            // 元数据没写时，文件名常带转换关系（如 SLog3_to_Rec709、BT2020）
            if (info.id === 'unknown') {
                const byName = classify(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), false);
                if (byName.id !== 'unknown') info = byName;
            }
        } catch (error) {
            // 读不到就按「未标注」处理，不阻断导入
        }
        const passes = info.id === 'rec709' || (info.id === 'unknown' && !STRICT_UNKNOWN);
        return { file: file, id: info.id, label: info.label, blocked: !passes };
    }

    function inspectAll(files) {
        return Promise.all(files.map(inspectFile));
    }

    // ---------- 流程衔接 ----------

    let bypass = false;
    let isOpen = false;
    let seq = 0;
    let lastFocus = null;
    let prevHtmlOverflow = '';
    let prevBodyOverflow = '';
    let hideTimer = 0;

    function resumeImport() {
        bypass = true;
        try {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } finally {
            bypass = false;
        }
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
    }

    function openDialog(blocked) {
        if (isOpen) return;
        isOpen = true;
        clearTimeout(hideTimer);

        listEl.innerHTML = blocked.map((row) => (
            '<li><span>' + escapeHtml(row.file.name) + '</span><em>' + escapeHtml(row.label) + '</em></li>'
        )).join('');

        lastFocus = document.activeElement;
        dialog.hidden = false;
        void dialog.offsetWidth;
        dialog.classList.add('is-open');

        prevHtmlOverflow = document.documentElement.style.overflow;
        prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        yesBtn.focus({ preventScroll: true });
    }

    function closeDialog(accept) {
        if (!isOpen) return;
        isOpen = false;

        dialog.classList.remove('is-open');
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => { dialog.hidden = true; }, 220);

        if (accept) {
            resumeImport();
        } else {
            // 中止：清空选择，下一次选同一个文件仍会触发 change
            input.value = '';
        }

        const target = (lastFocus && lastFocus !== document.body && typeof lastFocus.focus === 'function')
            ? lastFocus
            : host.querySelector('[data-action="load-luts"]');
        if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
    }

    // capture 阶段拦下 change，app.js 的冒泡监听不会收到这一次
    host.addEventListener('change', (event) => {
        if (event.target !== input || bypass) return;
        const files = Array.prototype.slice.call(input.files || []);
        if (!files.length) return;

        event.stopImmediatePropagation();
        event.stopPropagation();

        const current = ++seq;
        inspectAll(files).then((rows) => {
            if (current !== seq) return;   // 已有更新的选择，丢弃这一次
            const blocked = rows.filter((row) => row.blocked);
            if (!blocked.length) {
                resumeImport();
                return;
            }
            openDialog(blocked);
        }).catch(() => {
            if (current !== seq) return;
            // 识别过程出错时不阻断，按正常流程导入
            resumeImport();
        });
    }, true);

    // ---------- 弹窗交互 ----------

    yesBtn.addEventListener('click', () => closeDialog(true));
    noBtn.addEventListener('click', () => closeDialog(false));

    dialog.querySelector('.lut-confirm-scrim').addEventListener('click', () => closeDialog(false));

    document.addEventListener('keydown', (event) => {
        if (!isOpen) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeDialog(false);
        } else if (event.key === 'Tab') {
            const first = noBtn;
            const last = yesBtn;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
})();
