/* ============================================================
   js/script.js
   功能模块：汉堡菜单、导航高亮、滚动入场动画
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== 1. DOM 元素引用 ====================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-list a');
    const sections = document.querySelectorAll('.section');

    // ==================== 2. 移动端汉堡菜单逻辑 ====================
    function toggleMenu() {
        if (hamburger && navMenu) {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        }
    }
    
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // ==================== 3. 滚动入场动画 (IntersectionObserver) ====================
    sections.forEach(section => section.classList.add('reveal'));
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    sections.forEach(section => revealObserver.observe(section));

    // ==================== 4. 导航栏当前区域高亮 ====================
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const currentLink = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
                if (currentLink) {
                    currentLink.classList.add('active');
                }
            }
        });
    }, { threshold: 0.3 });

    // 留意：#start 是 dev 页面的主入口区域
    document.querySelectorAll('#start, #projects, #about').forEach(section => {
        activeObserver.observe(section);
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            navLinks.forEach(link => link.classList.remove('active'));
        }
    });

    /* ==================== 额外：强制唤醒 Hero 视频 ==================== */
    const heroVideo = document.querySelector('.hero-bg-image video');
    if (heroVideo) {
        heroVideo.play().catch(() => {
            const wakeVideo = () => {
                heroVideo.play().catch(() => {});
                document.removeEventListener('click', wakeVideo);
            };
            document.addEventListener('click', wakeVideo);
        });
    }
});