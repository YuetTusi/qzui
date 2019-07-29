/**
 * Electron 入口文件
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./src/config/config.json');

let mainWindow = null;
app.on('ready', () => {

    mainWindow = new BrowserWindow({
        width: config.windowWidth,
        height: config.windowHeight,
        fullscreen: config.isFullScreen,
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

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});