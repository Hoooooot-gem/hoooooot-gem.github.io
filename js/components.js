/* ============================================================
   js/components.js
   共享顶栏 / 底栏注入器 + 移动端菜单
   ------------------------------------------------------------
   改动说明（2026-10）：
   1. 支持 data-chrome 控制注入范围，方便沉浸页只取底栏：
        <script src="/js/components.js" data-chrome="both">    顶栏 + 底栏（默认）
        <script src="/js/components.js" data-chrome="footer">  仅底栏
   2. 底栏优先插到「body 直接子级 main」之后；没有则追加到 body
      末尾，避免插进全屏容器的内部（BH / ZF / HZUQJ 属于这类）。
   3. 首页内锚点只在首页拦截平滑滚动；其他页面交还浏览器默认跳转，
      修复子页面点击导航没有反应的问题。
   ============================================================ */

// 脚本执行时记录自身：DOMContentLoaded 回调里 currentScript 已经是 null
const chromeScript = document.currentScript;
const chromeMode = (chromeScript && chromeScript.dataset.chrome) || 'both';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 顶栏（沉浸页跳过）
        if (chromeMode !== 'footer') {
            const headerResponse = await fetch('/header.html');
            const headerHTML = await headerResponse.text();
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
            // 标记「有顶栏」，供 css/pages.css 计算内容区上边距
            document.body.classList.add('has-chrome');
            bindHeader();
        }

        // 2. 底栏（所有页面都有）
        if (chromeMode !== 'header') {
            const footerResponse = await fetch('/footer.html');
            const footerHTML = await footerResponse.text();
            insertFooter(footerHTML);
        }
    } catch (error) {
        console.error('组件加载失败，请检查 header.html/footer.html 是否存在', error);
    } finally {
        // 顶栏/底栏注入完毕（失败也算一次），首页据此补写导航文案
        document.dispatchEvent(new CustomEvent('chrome:ready'));
    }
});

function insertFooter(footerHTML) {
    const directMains = document.querySelectorAll('body > main');
    if (directMains.length > 0) {
        directMains[directMains.length - 1].insertAdjacentHTML('afterend', footerHTML);
    } else {
        // 没有独立 main 的沉浸页：直接追加到 body 末尾
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
    // 页脚占位会改变内容区高度（全景页的 canvas 依赖容器尺寸），
    // 注入完成后主动广播一次 resize，让页面按新高度重排。
    window.dispatchEvent(new Event('resize'));
}

function bindHeader() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');

            const href = link.getAttribute('href');

            // 只处理首页内部的锚点链接
            if (href && href.startsWith('/#')) {
                const targetId = href.substring(2);

                // 找到当前可见的那一版首页（中国版 / 国际版）
                let activeHome = null;
                document.querySelectorAll('#home-main, #china-home, #global-home').forEach(home => {
                    const style = getComputedStyle(home);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        activeHome = home;
                    }
                });

                // 子页面没有首页容器：不拦截，交给浏览器跳到 /#xxx
                if (!activeHome) return;

                e.preventDefault();

                const target = activeHome.querySelector(`#${targetId}`);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}
