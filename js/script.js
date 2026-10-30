/* ============================================================
   js/script.js
   功能模块：导航高亮、滚动入场动画、二维码弹层、画廊跑马灯、
             滚动毛玻璃控制、Hero 视频兜底播放
   说明：音乐播放器模块已移除（2026-10），不再创建 Audio 实例，
         也不再尝试自动播放音频。
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== 1. DOM 元素引用 ====================
    const navLinks = document.querySelectorAll('.nav-list a');
    const sections = document.querySelectorAll('.section');

    // ==================== 2. 滚动入场动画 (IntersectionObserver) ====================
    sections.forEach(section => section.classList.add('reveal'));
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    sections.forEach(section => revealObserver.observe(section));

    // ==================== 3. 导航栏当前区域高亮 ====================
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
    document.querySelectorAll('#tools, #about, #summer-camp, #portfolio, #timeline, #contact').forEach(section => {
        activeObserver.observe(section);
    });
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            navLinks.forEach(link => link.classList.remove('active'));
        }
    });

    // ==================== 4. 视频号二维码交互逻辑 ====================
    const wechatItems = document.querySelectorAll('.wechat-item');
    wechatItems.forEach(wechatItem => {
        const qrPopup = wechatItem.querySelector('.qr-popup');
        if (!qrPopup) return;
        wechatItem.addEventListener('mouseenter', () => {
            qrPopup.classList.add('active');
        });
        wechatItem.addEventListener('mouseleave', () => {
            qrPopup.classList.remove('active');
        });
        wechatItem.addEventListener('click', (e) => {
            e.stopPropagation();
            qrPopup.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!wechatItem.contains(e.target)) {
                qrPopup.classList.remove('active');
            }
        });
    });

// ==================== 5. 画廊无限跑马灯 ====================
(function() {
    const galleryImages = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg'];
    if (galleryImages.length === 0) return;
    const tracks = document.querySelectorAll('#gallery-track');
    if (tracks.length === 0) return;
    tracks.forEach(track => {
        galleryImages.forEach(url => {
            const div = document.createElement('div');
            div.className = 'carousel-item';
            div.innerHTML = `<img src="/images/homegallery/${url}" alt="gallery" loading="lazy">`;
            track.appendChild(div);
        });
        const firstGroupItems = [...track.children];
        firstGroupItems.forEach(item => {
            track.appendChild(item.cloneNode(true));
        });
        track.style.animationDuration = (galleryImages.length * 4) + 's';
    });
})();

    // ==================== 6. 滚动控制顶栏浮现 ====================
    // 改动说明：原「播放栏同步浮现」逻辑随音乐播放器一并删除，
    // 顶栏毛玻璃的触发阈值与行为保持不变。
    window.addEventListener('scroll', () => {
        const navbarDynamic = document.querySelector('.navbar');

        if (window.scrollY > 10) {
            if (navbarDynamic) navbarDynamic.classList.add('scrolled');
        } else {
            if (navbarDynamic) navbarDynamic.classList.remove('scrolled');
        }
    });

    // ==================== 7. 强制唤醒 Hero 视频 ====================
    // 改动说明：此逻辑原先嵌在播放器模块内部，播放器删除后单独拆出，
    // 以免移动端因自动播放策略而停在封面帧。
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
