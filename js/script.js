/* ============================================================
   js/script.js
   功能模块：汉堡菜单、深色模式、导航高亮、滚动入场动画
   ============================================================ */

'use strict'; // 严格模式，避免潜在的全局污染

// ==================== 1. DOM 元素引用 ====================

// 获取汉堡菜单按钮、导航菜单容器、所有导航链接
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-list a');

// 获取深色模式切换按钮
const themeToggle = document.getElementById('theme-toggle');

// 获取页面中所有带 .section 类的区块（用于入场动画和高亮监听）
const sections = document.querySelectorAll('.section');


// ==================== 2. 移动端汉堡菜单逻辑 ====================

/**
 * 切换汉堡菜单的展开状态
 * 同时控制按钮的“叉号”动画与菜单的滑入滑出
 */
function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
}

// 点击汉堡按钮触发切换
hamburger.addEventListener('click', toggleMenu);

// 点击导航菜单内的任意链接后，自动收起菜单（提升移动端体验）
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});


// ==================== 3. 深色模式切换与本地存储 ====================

/**
 * 根据主题状态更新切换按钮的图标显示（☀ / 🌙）
 * @param {string} theme - 'light' 或 'dark'
 */
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

/**
 * 初始化深色模式：读取 LocalStorage 中的用户偏好
 * 如果没有记录，默认设为深色模式（Dark Mode）
 */
function initTheme() {
  let savedTheme = localStorage.getItem('theme');
  
  // 如果本地没有存储过任何用户偏好，则默认设置为深色模式
  if (!savedTheme) {
    savedTheme = 'dark';
    localStorage.setItem('theme', savedTheme);
  }
  
  // 应用当前的主题
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// 点击切换按钮：在浅色与深色之间切换，并保存到 LocalStorage
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

// 页面加载时立即执行主题初始化
initTheme();


// ==================== 4. 滚动入场动画 (IntersectionObserver) ====================

/**
 * 为所有 .section 区块动态添加 .reveal 类（初始透明并下移）
 * 当区块进入视口时，添加 .is-visible 类触发 CSS 中的淡入上移动画
 */
sections.forEach(section => section.classList.add('reveal'));

// 创建观察者实例：当元素至少有 10% 进入视口时触发
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.1 });

// 观察所有区块
sections.forEach(section => revealObserver.observe(section));


// ==================== 5. 导航栏当前区域高亮 (IntersectionObserver) ====================

/**
 * 监听页面滚动，当某个章节进入视口时，自动高亮对应的导航菜单项
 * 如果页面滚动到顶部（Hero 区域），则取消所有高亮
 */
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 移除所有导航链接的 active 状态
      navLinks.forEach(link => link.classList.remove('active'));
      
      // 找到与当前进入视口的章节 ID 对应的导航链接并高亮
      const currentLink = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
      if (currentLink) {
        currentLink.classList.add('active');
      }
    }
  });
}, { threshold: 0.3 }); // 章节可见度达到 30% 时触发高亮

// 观察除 Hero 以外的所有章节（更新为包含 #summer-camp）
document.querySelectorAll('#about, #summer-camp, #portfolio, #timeline, #contact').forEach(section => {
  activeObserver.observe(section);
});

/**
 * 附加滚动监听：如果用户回到页面顶部（Hero 区域），
 * 清除所有导航高亮状态，保持视觉干净
 */
window.addEventListener('scroll', () => {
  if (window.scrollY < 100) {
    navLinks.forEach(link => link.classList.remove('active'));
  }
});


// ==================== 6. 未来扩展预留接口 ====================
/* 
   Future Extensions API (Not Implemented):
   - 博客（Blog）列表动态加载
   - 画廊（Gallery）灯箱预览
   - 笔记（Notes）滑动分页
   - 旅行（Travel）地图组件
   - 独立项目（Projects）路由切换
   - 上述功能只需在此文件底部添加对应模块，无需修改现有核心代码
*/

/* ==================== 7. 视频号二维码交互逻辑 ==================== */

const wechatItem = document.querySelector('.wechat-item');
const qrPopup = document.getElementById('wechat-qr');

if (wechatItem && qrPopup) {
    // 桌面端悬停（鼠标移入/移出）
    wechatItem.addEventListener('mouseenter', () => {
        qrPopup.classList.add('active');
    });
    wechatItem.addEventListener('mouseleave', () => {
        qrPopup.classList.remove('active');
    });

    // 移动端点击切换（兼容触屏）
    wechatItem.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止冒泡
        qrPopup.classList.toggle('active');
    });

    // 点击页面其他任何位置，自动收起二维码
    document.addEventListener('click', (e) => {
        if (!wechatItem.contains(e.target)) {
            qrPopup.classList.remove('active');
        }
    });
}

/* ==================== 8. 画廊无限跑马灯核心逻辑 ==================== */

(function() {
    // 1. 图片列表（你以后只需要在这里加名字即可）
    const galleryImages = [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
    ];
    if (galleryImages.length === 0) return;

    const track = document.getElementById('gallery-track');
    if (!track) return;

    // 2. 生成第一组图片
    galleryImages.forEach(url => {
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = `<img src="/images/homegallery/${url}" alt="gallery" loading="lazy">`;
        track.appendChild(div);
    });

    // 3. 核心：**克隆**第一组图片追加到末尾，实现无缝循环的关键！
    const firstGroupItems = [...track.children];
    firstGroupItems.forEach(item => {
        track.appendChild(item.cloneNode(true));
    });

    // 4. 根据图片数量，动态设定一个舒服的匀速滑动速度（图片越多，速度自然越慢）
    // 公式：4 秒/张。例如 5 张图，全程走完就是 20 秒。
    track.style.animationDuration = (galleryImages.length * 4) + 's';
    // 【新增】：如果系统启用了“减弱动效”，将动画时间设为 0（实际上会停止）
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        track.style.animationDuration = '0s';
    }

})();

/* ==================== 核心：物理透镜 & 色差渲染 ==================== */
(function() {
    'use strict';

    const playerWrapper = document.getElementById('glass-player-wrapper');
    const playerEl = document.getElementById('glass-player');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressFill = document.getElementById('progressFill');
    const progressThumb = document.getElementById('progressThumb');
    const progressContainer = document.getElementById('progressContainer');
    
    let isPlaying = false;
    let progress = 0;
    let animationFrameId = null;
    let lastTimestamp = 0;

    // === 1. 核心算法：动态生成 物理透镜位移图 ===
    function generateLensMap(width, height, borderRadius, scale) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        const cx = width / 2;
        const cy = height / 2;
        const br = Math.min(borderRadius, Math.min(width, height) / 2);
        const halfW = Math.floor(width / 2);
        const halfH = Math.floor(height / 2);

        const lensDepth = scale * 255;

        for (let y = 0; y < halfH; y++) {
            for (let x = 0; x < halfW; x++) {
                let dx = x - cx;
                let dy = y - cy;

                // 处理圆角边缘逻辑
                const radX = halfW - br;
                const radY = halfH - br;
                
                // 【修复】：把变量放到外面，解决 ReferenceError 报错
                let isInside = true; 
                let dist;
                if (x < radX && y < radY) {
                    // 内部方形区域，距离为 0
                    dist = 0; 
                } else {
                    // 边缘过度区域
                    const ex = Math.max(0, x - radX) / br;
                    const ey = Math.max(0, y - radY) / br;
                    const eDist = Math.sqrt(ex * ex + ey * ey);
                    if (eDist > 1) isInside = false;
                    dist = Math.min(eDist, 1);
                }

                let intensity = Math.pow(dist, 1.5) * lensDepth;
                const angle = Math.atan2(dy, dx);
                const dx_shift = Math.cos(angle) * intensity;
                const dy_shift = Math.sin(angle) * intensity;

                const r = 128 + dx_shift;
                const g = 128 + dy_shift;
                const b = 128;

                const writePixel = (px, py, rVal, gVal, bVal, alpha) => {
                    if (px < 0 || px >= width || py < 0 || py >= height) return;
                    const idx = (py * width + px) * 4;
                    data[idx] = rVal;
                    data[idx+1] = gVal;
                    data[idx+2] = bVal;
                    data[idx+3] = alpha;
                };

                if (isInside) {
                    const angle = Math.atan2(dy, dx);
                    const dx_shift = Math.cos(angle) * intensity;
                    const dy_shift = Math.sin(angle) * intensity;
                    const r = 128 + dx_shift;
                    const g = 128 + dy_shift;
                    const b = 128;
                    writePixel(x, y, r, g, b, 255);
                    writePixel(width - 1 - x, y, 256 - r, g, b, 255);
                    writePixel(x, height - 1 - y, r, 256 - g, b, 255);
                    writePixel(width - 1 - x, height - 1 - y, 256 - r, 256 - g, b, 255);
                } else {
                    writePixel(x, y, 128, 128, 128, 0);
                    writePixel(width - 1 - x, y, 128, 128, 128, 0);
                    writePixel(x, height - 1 - y, 128, 128, 128, 0);
                    writePixel(width - 1 - x, height - 1 - y, 128, 128, 128, 0);
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    }

    // === 2. 将生成的映射图应用到播放器 ===
    let filterVersion = 0;

    function applyGlassEffect() {
        const rect = playerEl.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        const radius = Math.min(w, h) / 2;

        if (w === 0 || h === 0) return;

        const mapDataURL = generateLensMap(w, h, radius, 0.12);

        filterVersion++;
        const filterId = `glass-filter-v${filterVersion}`;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('style', 'position:absolute;width:0;height:0;');
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);

        const imageEl = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        imageEl.setAttribute('href', mapDataURL);
        imageEl.setAttribute('width', w);
        imageEl.setAttribute('height', h);
        imageEl.setAttribute('result', 'displacementMap');
        filter.appendChild(imageEl);

        const displace = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        displace.setAttribute('in', 'SourceGraphic');
        displace.setAttribute('in2', 'displacementMap');
        displace.setAttribute('scale', '1');
        displace.setAttribute('xChannelSelector', 'R');
        displace.setAttribute('yChannelSelector', 'G');
        displace.setAttribute('result', 'displaced');
        filter.appendChild(displace);

        const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        colorMatrix.setAttribute('type', 'matrix');
        colorMatrix.setAttribute('values', '1.1 0 0 0 0  0 0.9 0 0 0  0 0 0.8 0 0  0 0 0 1 0');
        colorMatrix.setAttribute('result', 'chroma');
        filter.appendChild(colorMatrix);

        const specLight = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
        specLight.setAttribute('in', 'SourceAlpha');
        specLight.setAttribute('surfaceScale', '3');
        specLight.setAttribute('specularConstant', '0.6');
        specLight.setAttribute('specularExponent', '30');
        specLight.setAttribute('result', 'specular');
        
        const pointLight = document.createElementNS('http://www.w3.org/2000/svg', 'fePointLight');
        pointLight.setAttribute('x', '-50');
        pointLight.setAttribute('y', '-50');
        pointLight.setAttribute('z', '200');
        specLight.appendChild(pointLight);
        filter.appendChild(specLight);

        const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        composite.setAttribute('in', 'specular');
        composite.setAttribute('in2', 'chroma');
        composite.setAttribute('operator', 'arithmetic');
        composite.setAttribute('k1', '0');
        composite.setAttribute('k2', '1');
        composite.setAttribute('k3', '0.3');
        composite.setAttribute('k4', '0');
        filter.appendChild(composite);

        defs.appendChild(filter);
        svg.appendChild(defs);

        const oldSvg = playerWrapper.querySelector('svg');
        if (oldSvg) oldSvg.remove();
        playerWrapper.prepend(svg);

        playerEl.style.filter = `url(#${filterId})`;
    }

    // 初始化：首次渲染
    setTimeout(applyGlassEffect, 50);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyGlassEffect, 100);
    });

/* ============================================================
   真实音频播放逻辑（去掉限速）
   ============================================================ */

const audio = document.getElementById('bgMusic');
const progressTime = document.getElementById('progressTime');

audio.volume = 0.5;

// 尝试自动播放，如果被浏览器拦截则静默忽略
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
    if (!audio.duration || !isFinite(audio.duration)) return;

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

})();