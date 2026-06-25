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