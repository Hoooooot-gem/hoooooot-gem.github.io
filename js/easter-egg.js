/* ============================================================
   js/easter-egg.js
   首页联系区的隐藏彩蛋（只在 index.html 引入，子页面零影响）
   ------------------------------------------------------------
   行为约定：
   1. 邮箱地址是一个「长得像纯文本」的输入框，可直接键入与删除，
      宽度随内容实时变化，视觉上与原来的 <a> 文本一致。
   2. 回车时：
      · 内容为 OMG（忽略大小写与首尾空格）→ 跳转 /egg/ 彩蛋页
      · 其他任何内容 → 输入框下方弹出带尖角的气泡「干啥」，
        停留 4 秒后自动淡出消失
   3. 气泡 pointer-events: none，不遮挡、不拦截页面任何点击；
      每次弹出都按输入框实际位置重新计算并夹在视口内，窄屏自动避让。
   4. 中文输入法组词过程中的回车不触发（isComposing）。
   ============================================================ */

'use strict';

(function () {
    var SECRET_WORD = 'OMG';
    var BUBBLE_TEXT = '干啥';
    var HOLD_MS = 4000;   // 气泡停留时长
    var EDGE = 12;        // 气泡与视口边缘的最小安全距离

    document.addEventListener('DOMContentLoaded', function () {
        var fields = document.querySelectorAll('.mail-field');
        if (!fields.length) return;

        // 共享的文字测量节点：与输入框同字体，只用来算「这段文字有多宽」
        var measurer = document.createElement('span');
        measurer.setAttribute('aria-hidden', 'true');
        measurer.style.cssText =
            'position:absolute;top:0;left:-9999px;visibility:hidden;white-space:pre;pointer-events:none;';
        document.body.appendChild(measurer);

        Array.prototype.forEach.call(fields, function (field) {
            initField(field, measurer);
        });
    });

    function initField(field, measurer) {
        var input = field.querySelector('.mail-input');
        var bubble = field.querySelector('.mail-bubble');
        if (!input || !bubble) return;

        var hideTimer = null;   // 4 秒停留计时
        var clearTimer = null;  // 淡出后清空文案的计时

        // ---------- 1. 宽度跟随内容 ----------
        function syncWidth() {
            var cs = window.getComputedStyle(input);
            measurer.style.fontFamily = cs.fontFamily;
            measurer.style.fontSize = cs.fontSize;
            measurer.style.fontWeight = cs.fontWeight;
            measurer.style.fontStyle = cs.fontStyle;
            measurer.style.letterSpacing = cs.letterSpacing;
            measurer.style.wordSpacing = cs.wordSpacing;
            measurer.style.textTransform = cs.textTransform;
            measurer.textContent = input.value;

            // +2px 给光标留位，避免最后一个字符被裁掉
            var width = Math.ceil(measurer.getBoundingClientRect().width) + 2;
            if (width > 0) input.style.width = width + 'px';
        }

        // ---------- 2. 气泡定位 ----------
        function placeBubble() {
            // 先归零量出气泡的自然宽度，再决定左右位置
            bubble.style.left = '0px';
            var bubbleWidth = bubble.offsetWidth;

            var fieldRect = field.getBoundingClientRect();
            var inputRect = input.getBoundingClientRect();
            var viewport = document.documentElement.clientWidth;

            // 目标：气泡水平中心对准输入框中心
            var inputCenter = inputRect.left - fieldRect.left + inputRect.width / 2;
            var left = inputCenter - bubbleWidth / 2;

            // 夹在视口内（换算成相对 .mail-field 的坐标）
            var minLeft = EDGE - fieldRect.left;
            var maxLeft = viewport - EDGE - bubbleWidth - fieldRect.left;
            if (maxLeft < minLeft) maxLeft = minLeft;
            left = Math.min(Math.max(left, minLeft), maxLeft);

            bubble.style.left = left + 'px';

            // 尖角始终指向输入框中心，即使气泡被推到了边上
            var tail = Math.min(Math.max(inputCenter - left, 16), bubbleWidth - 16);
            bubble.style.setProperty('--tail-x', tail + 'px');
        }

        // ---------- 3. 显示 / 隐藏 ----------
        function show() {
            window.clearTimeout(hideTimer);
            window.clearTimeout(clearTimer);

            var alreadyVisible = bubble.classList.contains('is-visible');

            bubble.textContent = BUBBLE_TEXT;
            placeBubble();

            if (alreadyVisible) {
                // 已在显示中：只给一个小回弹，表示「又按了一次」
                bubble.classList.remove('is-nudge');
                void bubble.offsetWidth;   // 强制重排，让动画可以重播
                bubble.classList.add('is-nudge');
            } else {
                bubble.classList.add('is-visible');
            }

            hideTimer = window.setTimeout(hide, HOLD_MS);
        }

        function hide() {
            window.clearTimeout(hideTimer);
            hideTimer = null;
            bubble.classList.remove('is-visible', 'is-nudge');

            // 淡出结束后再清空文案，下次弹出时读屏才会重新播报
            clearTimer = window.setTimeout(function () {
                if (!bubble.classList.contains('is-visible')) bubble.textContent = '';
            }, 260);
        }

        // ---------- 4. 键盘交互 ----------
        input.addEventListener('keydown', function (event) {
            // 输入法正在组词：这个回车属于输入法，不拦截
            if (event.isComposing || event.keyCode === 229) return;

            if (event.key === 'Escape') {
                if (bubble.classList.contains('is-visible')) {
                    event.preventDefault();
                    hide();
                }
                return;
            }

            if (event.key !== 'Enter' && event.keyCode !== 13) return;

            // 输入框不在表单内，这里拦下回车只为避免浏览器的隐式提交行为
            event.preventDefault();

            if (input.value.trim().toUpperCase() === SECRET_WORD) {
                window.location.href = '/egg/';
                return;
            }

            show();
        });

        // ---------- 5. 同步 ----------
        input.addEventListener('input', syncWidth);

        var resizeTick = null;
        window.addEventListener('resize', function () {
            if (resizeTick) window.cancelAnimationFrame(resizeTick);
            resizeTick = window.requestAnimationFrame(function () {
                syncWidth();
                if (bubble.classList.contains('is-visible')) placeBubble();
            });
        });

        syncWidth();

        // 自定义字体是异步加载的，字体就位后字宽会变，需要重新量一次
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(syncWidth);
        }
    }
})();
