/**
 * Electron 入口文件
 */
const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./src/config/ui.config');

let mainWindow = null;
let listeningWindow = null;
app.on('ready', () => {

    mainWindow = new BrowserWindow({
        width: config.windowWidth, //主窗体宽
        height: config.windowHeight,//主窗体高
        fullscreen: config.isFullScreen,//是否全屏
        autoHideMenuBar: config.autoHideMenuBar,//隐藏主窗口菜单
        center: config.center,//居中显示
        minHeight: config.minHeight, //最小高度
        minWidth: config.minWidth,//最小宽度
        webPreferences: {
            nodeIntegration: true,
            javascript: true,
            // preload: path.join(__dirname, './src/service/listening.js')
        }
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL(config.devPageUrl);
    } else {
        mainWindow.loadURL(config.prodPageUrl);
    }

});
//监听USB
ipcMain.on('listening-usb', (event, args) => {
    if (listeningWindow === null) {
        listeningWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
        listeningWindow.loadFile(path.resolve(__dirname, './src/renderer/ListeningUsb/ListeningUsb.html'));
    }
});
//监听到的USB数据，转发给mainWindow
ipcMain.on('receive-listening-usb', (event, args) => {
    if (mainWindow) {
        mainWindow.webContents.send('receive-listening-usb', args);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        listeningWindow = null;
        mainWindow = null;
        app.quit();
    }
});