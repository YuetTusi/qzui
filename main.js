/**
 * Electron 入口文件
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;
app.on('ready', () => {

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            javascript: true,
            // webSecurity: false,
            // plugins: true,
            // preload: path.resolve(__dirname, './template/scripts/renderer.js')
        }
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:8081/index.html');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});