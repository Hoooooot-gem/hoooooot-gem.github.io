const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    icon: path.join(__dirname, 'icon.ico'),  // 设置图标
    frame: true,                // 保留系统边框和标题栏
    autoHideMenuBar: false,     // 不自动隐藏菜单栏（因为我们要彻底移除）
    webPreferences: {
      nodeIntegration: true,    // 允许网页使用Node.js
      contextIsolation: false   // 与渲染进程共享上下文
    }
  })

  // 彻底禁用菜单（包括Alt键唤出）
  win.setMenu(null)
  win.removeMenu()  // 双重保险

  // 加载页面
  win.loadFile('index.html')

  // 开发工具（可选）
  // win.webContents.openDevTools()
}

app.whenReady().then(createWindow)