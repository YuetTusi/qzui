const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./src/config/ui.config');

let mainWindow = null;
let listeningWindow = null;
let collectingDetailWindow = null;

app.on('ready', () => {

    mainWindow = new BrowserWindow({
        title: config.title || '安证网信数字取证系统',
        width: config.windowWidth || 1200, //主窗体宽
        height: config.windowHeight || 800,//主窗体高
        fullscreen: config.isFullScreen || false,//是否全屏
        autoHideMenuBar: config.autoHideMenuBar || true,//隐藏主窗口菜单
        center: config.center || true,//居中显示
        minHeight: config.minHeight || 800, //最小高度
        minWidth: config.minWidth || 800,//最小宽度
        webPreferences: {
            nodeIntegration: true,
            javascript: true
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
            show: config.isShowRenderer,
            webPreferences: {
                nodeIntegration: true
            }
        });
        listeningWindow.webContents.openDevTools();
        listeningWindow.loadFile(path.resolve(__dirname, './src/renderer/ListeningUsb/ListeningUsb.html'));
    }
});
//监听到的USB数据，转发给mainWindow
ipcMain.on('receive-listening-usb', (event, args) => {
    if (mainWindow) {
        mainWindow.webContents.send('receive-listening-usb', args);
    }
});

//采集详情实时数据
ipcMain.on('collecting-detail', (event, args) => {
    if (collectingDetailWindow === null) {
        collectingDetailWindow = new BrowserWindow({
            show: config.isShowRenderer,
            webPreferences: {
                nodeIntegration: true
            }
        });
        collectingDetailWindow.webContents.openDevTools();
        collectingDetailWindow.loadFile(path.resolve(__dirname, './src/renderer/CollectingDetail/CollectingDetail.html'));
        collectingDetailWindow.webContents.on('did-finish-load', () => {
            collectingDetailWindow.webContents.send('phone-params', args);
        });
    }
    collectingDetailWindow.webContents.send('phone-params', args);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        listeningWindow = null;
        mainWindow = null;
        app.quit();
    }
});