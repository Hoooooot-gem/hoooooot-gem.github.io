/* ============================================================
   js/script.js
   功能模块：汉堡菜单、导航高亮、滚动入场动画、播放器、滚动毛玻璃控制
   ============================================================ */

'use strict';

// 【核心修复】：等整个页面的 DOM 结构加载完毕后再执行
document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== 1. DOM 元素引用（提前抓取） ====================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-list a');
    const sections = document.querySelectorAll('.section');

    // 【注意】：navbar 和 playerWrapper 不在这里定义了，改为滚动时动态获取！

    if (!hamburger || !navMenu) {
        console.warn('顶栏组件还未加载，稍后会自动同步');
    }

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
    document.querySelectorAll('#about, #summer-camp, #portfolio, #timeline, #contact').forEach(section => {
        activeObserver.observe(section);
    });
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            navLinks.forEach(link => link.classList.remove('active'));
        }
    });

    // ==================== 5. 视频号二维码交互逻辑 ====================
    const wechatItem = document.querySelector('.wechat-item');
    const qrPopup = document.getElementById('wechat-qr');
    if (wechatItem && qrPopup) {
        wechatItem.addEventListener('mouseenter', () => { qrPopup.classList.add('active'); });
        wechatItem.addEventListener('mouseleave', () => { qrPopup.classList.remove('active'); });
        wechatItem.addEventListener('click', (e) => {
            e.stopPropagation();
            qrPopup.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!wechatItem.contains(e.target)) {
                qrPopup.classList.remove('active');
            }
        });
    }

    // ==================== 6. 画廊无限跑马灯 ====================
    (function() {
        const galleryImages = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg'];
        if (galleryImages.length === 0) return;
        const track = document.getElementById('gallery-track');
        if (!track) return;
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
    })();

    // ==================== 7. 滚动控制顶栏与播放栏同步浮现（动态抓取修复版） ====================
    window.addEventListener('scroll', () => {
        // 【核心修复】：每次触发滚动时，实时去页面里找顶栏和播放栏。
        // 这样哪怕 components.js 是一秒后才把顶栏塞进来的，滚动时也能立刻抓到。
        const navbarDynamic = document.querySelector('.navbar');
        const playerWrapperDynamic = document.getElementById('player-wrapper');

        if (window.scrollY > 10) {
            if (navbarDynamic) navbarDynamic.classList.add('scrolled');
            if (playerWrapperDynamic) playerWrapperDynamic.classList.add('visible');
        } else {
            if (navbarDynamic) navbarDynamic.classList.remove('scrolled');
            if (playerWrapperDynamic) playerWrapperDynamic.classList.remove('visible');
        }
    });

    // ==================== 8. 右下角胶囊播放栏 ====================
    (function() {
        'use strict';
        const playBtn = document.getElementById('playBtn');
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        const progressFill = document.getElementById('progressFill');
        const progressThumb = document.getElementById('progressThumb');
        const progressContainer = document.getElementById('progressContainer');
        const progressTime = document.getElementById('progressTime');
        const audio = document.getElementById('bgMusic');

        if (!playBtn || !audio) return;

        audio.volume = 0.5;
        audio.play().catch(() => console.log('等待用户点击播放'));

        let isDragging = false;

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        });

        audio.addEventListener('play', () => {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        });

        audio.addEventListener('pause', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        });

        audio.addEventListener('timeupdate', () => {
            if (!isDragging) {
                updateProgressUI();
            }
        });

        audio.addEventListener('ended', () => {
            progressFill.style.width = '0%';
            progressThumb.style.left = '0%';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        });

        function updateProgressFromEvent(e) {
            const rect = progressContainer.getBoundingClientRect();
            let x = (e.clientX - rect.left) / rect.width;
            x = Math.min(1, Math.max(0, x));
            audio.currentTime = x * audio.duration;
            updateProgressUI();
        }

        progressContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateProgressFromEvent(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateProgressFromEvent(e);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
            }
        });

        function updateProgressUI() {
            if (!audio.duration || !isFinite(audio.duration) || !progressTime) return;
            const percent = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = percent + '%';
            progressThumb.style.left = percent + '%';
            const currentMin = Math.floor(audio.currentTime / 60);
            const currentSec = Math.floor(audio.currentTime % 60);
            const totalMin = Math.floor(audio.duration / 60);
            const totalSec = Math.floor(audio.duration % 60);
            progressTime.textContent = 
                `${currentMin}:${currentSec.toString().padStart(2, '0')} / ${totalMin}:${totalSec.toString().padStart(2, '0')}`;
        }

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
    })();
});