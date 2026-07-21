// js/components.js
// 这个脚本会自动把 header 和 footer 塞进页面里，并绑定菜单事件
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 获取并插入顶栏
        const headerResponse = await fetch('/header.html');
        const headerHTML = await headerResponse.text();
        document.body.insertAdjacentHTML('afterbegin', headerHTML);

        // 【核心修复】：因为 header 刚被插入 DOM，现在立刻绑定汉堡菜单是绝对安全的！
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-list a');

        if (hamburger && navMenu) {
            function toggleMenu() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            }
            hamburger.addEventListener('click', toggleMenu);

            // 点击菜单内的链接后，自动收起菜单（和之前逻辑保持一致）
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // 2. 获取并插入底栏
        const footerResponse = await fetch('/footer.html');
        const footerHTML = await footerResponse.text();
        const mainTag = document.querySelector('main');
        if (mainTag) {
            mainTag.insertAdjacentHTML('afterend', footerHTML);
        }
    } catch (error) {
        console.error('组件加载失败，请检查 header.html/footer.html 是否存在', error);
    }
});