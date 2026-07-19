/* ============================================================
   js/script.js
   功能模块：汉堡菜单、深色模式、导航高亮、滚动入场动画
   ============================================================ */

'use strict';

// ==================== 1. DOM 元素引用 ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-list a');
const themeToggle = document.getElementById('theme-toggle');
const sections = document.querySelectorAll('.section');

// ==================== 2. 移动端汉堡菜单逻辑 ====================
function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
}
hamburger.addEventListener('click', toggleMenu);
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// ==================== 3. 深色模式切换与本地存储 ====================
function updateThemeIcon(theme) {
  const iconSun = document.querySelector('.icon-sun');
  const iconMoon = document.querySelector('.icon-moon');
  if (theme === 'dark') {
    iconSun.style.display = 'none';
    iconMoon.style.display = 'inline';
  } else {
    iconSun.style.display = 'inline';
    iconMoon.style.display = 'none';
  }
}
function initTheme() {
  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    savedTheme = 'dark';
    localStorage.setItem('theme', savedTheme);
  }
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  let newTheme;
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    newTheme = 'light';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    newTheme = 'dark';
  }
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});
initTheme();

// ==================== 4. 滚动入场动画 (IntersectionObserver) ====================
sections.forEach(section => section.classList.add('reveal'));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.1 });
sections.forEach(section => revealObserver.observe(section));

// ==================== 5. 导航栏当前区域高亮 ====================
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

// ==================== 6. 视频号二维码交互逻辑 ====================
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

// ==================== 7. 画廊无限跑马灯 (去掉减动效限制) ====================
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
    // 【删除】之前的减动效拦截代码（0s），现在画廊会永远转动，不受系统影响。
})();

// ==================== 8. 右下角胶囊播放栏（真实音频播放逻辑） ====================
(function() {
    'use strict';

    const playerWrapper = document.getElementById('player-wrapper');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressFill = document.getElementById('progressFill');
    const progressThumb = document.getElementById('progressThumb');
    const progressContainer = document.getElementById('progressContainer');
    const progressTime = document.getElementById('progressTime');
    const audio = document.getElementById('bgMusic');

    // 音量 50%
    audio.volume = 0.5;

    // 尝试自动播放（如被浏览器拦截则等待用户点击）
    audio.play().catch(() => console.log('等待用户点击播放'));

    let isDragging = false;

    // 播放/暂停按钮逻辑
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

    // 进度条交互
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
        // 安全检查：防止 DOM 节点未加载时报错
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