// js/components.js
// 这个脚本会自动把 header 和 footer 塞进页面里
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 获取并插入顶栏
        const headerResponse = await fetch('/header.html');
        const headerHTML = await headerResponse.text();
        // 插入到 <body> 的最开头
        document.body.insertAdjacentHTML('afterbegin', headerHTML);

        // 2. 获取并插入底栏
        const footerResponse = await fetch('/footer.html');
        const footerHTML = await footerResponse.text();
        // 插入到 <main> 标签的后面
        const mainTag = document.querySelector('main');
        if (mainTag) {
            mainTag.insertAdjacentHTML('afterend', footerHTML);
        }
    } catch (error) {
        console.error('组件加载失败，请检查 header.html/footer.html 是否存在', error);
    }
});