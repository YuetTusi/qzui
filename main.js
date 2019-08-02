/**
 * Electron 入口文件
 */
const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./src/config/ui.config');

let mainWindow = null;
app.on('ready', () => {

    mainWindow = new BrowserWindow({
        width: config.windowWidth, //主窗体宽
        height: config.windowHeight,//主窗体高
        fullscreen: config.isFullScreen,//是否全屏
        autoHideMenuBar: config.autoHideMenuBar,//隐藏主窗口菜单
        center: config.center,//居中显示
        webPreferences: {
            nodeIntegration: true,
            javascript: true,
            preload: path.join(__dirname, './src/service/rpc.js')
        }
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL(config.devPageUrl);
    } else {
        mainWindow.loadURL(config.prodPageUrl);
    }

});

ipcMain.on('open-window', (msg) => {
    let childWindow = new BrowserWindow({
        width: 400,
        height: 300,
        parent: mainWindow
    });
    childWindow.show();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        mainWindow = null;
        app.quit();
    }
});