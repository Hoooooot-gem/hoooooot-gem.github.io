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

    // === 1. 核心算法：动态生成 物理透镜位移图 (四分之一对称镜像) ===
    // PDF 精髓：只算左上角四分之一，镜像到另外三个象限，性能巨大提升
    function generateLensMap(width, height, borderRadius, scale) {
        // 创建一个离屏 Canvas (高性能)
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        // 计算中心点、半径
        const cx = width / 2;
        const cy = height / 2;
        const br = Math.min(borderRadius, Math.min(width, height) / 2);
        const halfW = Math.floor(width / 2);
        const halfH = Math.floor(height / 2);

        // 物理透镜的“球面深度”参数
        const lensDepth = scale * 255; // 最大位移像素值映射到 0-255

        // 只遍历左上角 (0,0) 到 (halfW, halfH)
        for (let y = 0; y < halfH; y++) {
            for (let x = 0; x < halfW; x++) {
                // 计算该点离最近边缘的距离（模拟圆角矩形的物理凸起高度）
                // 类似 PDF 里的“透镜”光学效应
                let dx = x - cx;
                let dy = y - cy;

                // 处理圆角边缘逻辑
                const radX = halfW - br;
                const radY = halfH - br;
                
                let dist;
                if (x < radX && y < radY) {
                    // 内部方形区域，距离为 0
                    dist = 0; 
                } else {
                    // 边缘过度区域
                    const ex = Math.max(0, x - radX) / br;
                    const ey = Math.max(0, y - radY) / br;
                    const eDist = Math.sqrt(ex * ex + ey * ey);
                    let isInside = true; // 【新增】：先假设这个像素在圆角内部
                    if (eDist > 1) isInside = false; // 【新增】：如果这个像素离中心太远（在圆角外面），就把开关关掉
                    dist = Math.min(eDist, 1);
                }

                // 计算透镜折射强度（边缘最厚，中心为0）
                // 映射到 0~1 曲率
                let intensity = Math.pow(dist, 1.5) * lensDepth;

                // 计算 x 和 y 方向的位移量 (向外扩张的凸起)
                // 用三角归一化保证边缘不撕裂
                const angle = Math.atan2(dy, dx);
                const dx_shift = Math.cos(angle) * intensity;
                const dy_shift = Math.sin(angle) * intensity;

                // 用于 SVG 映射图的 Red (X位移) 和 Green (Y位移) 通道
                // 中性灰是 128。大于 128 向右/下移，小于 128 向左/上移
                const r = 128 + dx_shift;
                const g = 128 + dy_shift;
                const b = 128; // 蓝通道留空

                // 【新增】：这个函数负责把颜色和透明度写入像素
                const writePixel = (px, py, rVal, gVal, bVal, alpha) => {
                    if (px < 0 || px >= width || py < 0 || py >= height) return;
                    const idx = (py * width + px) * 4;
                    data[idx] = rVal;       // 红色通道
                    data[idx+1] = gVal;     // 绿色通道
                    data[idx+2] = bVal;     // 蓝色通道
                    data[idx+3] = alpha;    // 【核心修改】：alpha 不再是固定 255，而是根据传入的值决定透明度
                };

                // 【新增】如果像素在圆角内部 (isInside 为 true)
                if (isInside) {
                    // 先计算透镜的折射强度（和原来一样）
                    intensity = Math.pow(dist, 1.5) * lensDepth;
                    const angle = Math.atan2(dy, dx);
                    const dx_shift = Math.cos(angle) * intensity;
                    const dy_shift = Math.sin(angle) * intensity;

                    const r = 128 + dx_shift;
                    const g = 128 + dy_shift;
                    const b = 128;

                    // 【核心】：这里的最后一项改成 255，表示这四个角落是不透明的（有玻璃质感）
                    writePixel(x, y, r, g, b, 255);
                    writePixel(width - 1 - x, y, 256 - r, g, b, 255);
                    writePixel(x, height - 1 - y, r, 256 - g, b, 255);
                    writePixel(width - 1 - x, height - 1 - y, 256 - r, 256 - g, b, 255);
                } else {
                    // 【新增】如果像素在圆角外面 (就是那个讨厌的白框)
                    // 我们把它们全部写成“中立灰”，并且把透明度设为 0（完全透明）
                    // 这样它们就不会露出来了！
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

    // === 2. 将生成的映射图应用到播放器 (修复 Safari 缓存 Bug) ===
    let filterVersion = 0;

    function applyGlassEffect() {
        const rect = playerEl.getBoundingClientRect();
        // 胶囊的宽高和圆角
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        const radius = Math.min(w, h) / 2;

        if (w === 0 || h === 0) return;

        // 生成位移映射图 (scale=0.12 表示 12% 的最大边缘扭曲)
        const mapDataURL = generateLensMap(w, h, radius, 0.12);

        // 增加版本号，防止 Safari 缓存滤镜导致画面卡死 (文档里的重要技巧)
        filterVersion++;
        const filterId = `glass-filter-v${filterVersion}`;

        // 动态构建 SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('style', 'position:absolute;width:0;height:0;');
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);

        // 1. 映射图源
        const imageEl = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        imageEl.setAttribute('href', mapDataURL);
        imageEl.setAttribute('width', w);
        imageEl.setAttribute('height', h);
        imageEl.setAttribute('result', 'displacementMap');
        filter.appendChild(imageEl);

        // 2. 位移置换 (feDisplacementMap)
        const displace = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        displace.setAttribute('in', 'SourceGraphic');
        displace.setAttribute('in2', 'displacementMap');
        displace.setAttribute('scale', '1'); // 映射图自带位移比例
        displace.setAttribute('xChannelSelector', 'R');
        displace.setAttribute('yChannelSelector', 'G');
        displace.setAttribute('result', 'displaced');
        filter.appendChild(displace);

        // 3. 色差效果 (Chromatic Aberration) - 对应文档里的列出的参数
        const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        // 使用颜色矩阵把边缘的 R 和 B 分离出轻微的颜色偏移
        colorMatrix.setAttribute('type', 'matrix');
        // 矩阵魔改：加强 R 通道强度，减弱 B 通道强度，形成边缘色差
        colorMatrix.setAttribute('values', '1.1 0 0 0 0  0 0.9 0 0 0  0 0 0.8 0 0  0 0 0 1 0');
        colorMatrix.setAttribute('result', 'chroma');
        filter.appendChild(colorMatrix);

        // 4. 高光 (Specular Lighting) - 增加物理反光感
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

        // 混合高光到最终画面
        const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        composite.setAttribute('in', 'specular');
        composite.setAttribute('in2', 'chroma');
        composite.setAttribute('operator', 'arithmetic');
        composite.setAttribute('k1', '0');
        composite.setAttribute('k2', '1');
        composite.setAttribute('k3', '0.3'); // 高光强度
        composite.setAttribute('k4', '0');
        filter.appendChild(composite);

        defs.appendChild(filter);
        svg.appendChild(defs);

        // 移除旧的 SVG 并替换（强制浏览器重绘）
        const oldSvg = playerWrapper.querySelector('svg');
        if (oldSvg) oldSvg.remove();
        playerWrapper.prepend(svg);

        // 将滤镜应用到播放器
        playerEl.style.filter = `url(#${filterId})`;
    }

    // 初始化：首次渲染
    setTimeout(applyGlassEffect, 50);

    // 窗口大小变化时，重新生成映射图（保持透镜形状与播放器绝对一致）
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyGlassEffect, 100);
    });

/* ============================================================
   全新真实音频播放逻辑（替换掉之前的模拟动画）
   ============================================================ */

// 1. 获取音频元素和显示时间的元素
// 注意：playBtn、playIcon、pauseIcon 等已经在物理透镜部分声明过了，这里不用再次声明！
const audio = document.getElementById('bgMusic');       // 真实的音频元素
const progressTime = document.getElementById('progressTime'); // 显示时间的文字 (如 1:24)

// 【新增】：将默认音量设置为 50% (音量范围是 0.0 到 1.0)
audio.volume = 0.5;

// 尝试自动播放（浏览器可能会阻止，所以用 catch 捕获错误，保证不报红）
audio.play().catch(() => console.log('等待用户点击播放'));

let isDragging = false; // 记录用户是否正在拖拽进度条

// ============================================================
// 2. 播放/暂停按钮点击事件
// ============================================================
playBtn.addEventListener('click', () => {
    // 如果音频正在播放，就暂停；如果暂停了，就开始播放
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

// ============================================================
// 3. 监听音频播放状态，切换按钮图标
// ============================================================
audio.addEventListener('play', () => {
    // 开始播放时：隐藏播放图标，显示暂停图标
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
});

audio.addEventListener('pause', () => {
    // 暂停时：显示播放图标，隐藏暂停图标
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});

// ============================================================
// 4. 监听音频播放进度，更新进度条和显示时间
// ============================================================
audio.addEventListener('timeupdate', () => {
    // 只有当用户没有在拖拽进度条时，才自动更新进度条（防止拖拽时跳动）
    if (!isDragging) {
        updateProgressUI();
    }
});

// ============================================================
// 5. 监听音频播放结束，自动回到开头并变成播放状态
// ============================================================
audio.addEventListener('ended', () => {
    // 歌曲播完后，进度条回到 0
    progressFill.style.width = '0%';
    progressThumb.style.left = '0%';
    // 自动变成播放图标，以便用户再点击重播
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});

// ============================================================
// 6. 进度条交互：点击跳转、鼠标拖拽
// ============================================================

// 计算进度并更新的通用函数
function updateProgressFromEvent(e) {
    const rect = progressContainer.getBoundingClientRect(); // 获取进度条在屏幕上的位置和宽高
    let x = (e.clientX - rect.left) / rect.width;          // 计算鼠标点在进度条上的百分比 (0 到 1)
    x = Math.min(1, Math.max(0, x));                       // 限制范围，避免点出去超出 0 和 1
    audio.currentTime = x * audio.duration;                // 直接设定音频的当前播放时间
    updateProgressUI();                                    // 更新进度条的样式
}

// 用户按下鼠标时 (开始点击/拖拽)
progressContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateProgressFromEvent(e); // 点击的瞬间跳转一次
});

// 用户移动鼠标时 (正在拖拽)
window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateProgressFromEvent(e);
    }
});

// 用户松开鼠标时 (结束拖拽)
window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
    }
});

// ============================================================
// 7. 更新播放器界面的辅助函数
// ============================================================
function updateProgressUI() {
    // 如果音频没有加载时长（或者总时长是无穷大/NaN），不更新
    if (!audio.duration || !isFinite(audio.duration)) return;

    // 计算百分比
    const percent = (audio.currentTime / audio.duration) * 100;
    
    // 更新进度条宽度
    progressFill.style.width = percent + '%';
    progressThumb.style.left = percent + '%';

    // 更新下方显示的时间文字 (例如 1:24)
    const currentMin = Math.floor(audio.currentTime / 60);
    const currentSec = Math.floor(audio.currentTime % 60);
    const totalMin = Math.floor(audio.duration / 60);
    const totalSec = Math.floor(audio.duration % 60);
    
    // 如果秒数是 0-9，前面需要补一个 0 (比如 03)
    progressTime.textContent = 
        `${currentMin}:${currentSec.toString().padStart(2, '0')} / ${totalMin}:${totalSec.toString().padStart(2, '0')}`;
}

})();