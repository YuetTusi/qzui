const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./src/config/ui.config');

let mainWindow = null;
let listeningWindow = null;
let collectingDetailWindow = null;
let parsingDetailWindow = null;

/**
 * 销毁所有打开的窗口
 */
function destroyAllWindow() {
    if (collectingDetailWindow !== null) {
        collectingDetailWindow.destroy();
        collectingDetailWindow = null;
    }
    if (parsingDetailWindow !== null) {
        parsingDetailWindow.destroy();
        parsingDetailWindow = null;
    }
    if (listeningWindow !== null) {
        listeningWindow.destroy();
        listeningWindow = null;
    }
    if (mainWindow !== null) {
        mainWindow.destroy();
        mainWindow = null;
    }
}

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
        if (!config.publishPage) {
            config.publishPage = './dist/index.html';
        }
        mainWindow.loadURL(`file://${path.join(__dirname, config.publishPage)}`);
    }

    mainWindow.on('closed', () => {
        destroyAllWindow();
        app.exit(0);
    });
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
    } else {
        collectingDetailWindow.webContents.send('phone-params', args);
    }

});
ipcMain.on('receive-collecting-detail', (event, args) => {
    if (mainWindow) {
        mainWindow.webContents.send('receive-collecting-detail', args);
    }
});

//解析详情实时数据
ipcMain.on('parsing-detail', (event, args) => {
    if (parsingDetailWindow === null) {
        parsingDetailWindow = new BrowserWindow({
            show: config.isShowRenderer,
            webPreferences: {
                nodeIntegration: true
            }
        });
        parsingDetailWindow.webContents.openDevTools();
        parsingDetailWindow.loadFile(path.resolve(__dirname, './src/renderer/ParsingDetail/ParsingDetail.html'));
        parsingDetailWindow.webContents.on('did-finish-load', () => {
            parsingDetailWindow.webContents.send('phone-params', args);
        });
    } else {
        parsingDetailWindow.webContents.send('phone-params', args);
    }
});
ipcMain.on('receive-parsing-detail', (event, args) => {
    if (mainWindow) {
        mainWindow.webContents.send('receive-parsing-detail', args);
    }
});

//取得发布目录
ipcMain.on('publish-path', (event, args) => {
    const publishPath = path.join(__dirname);
    if (mainWindow) {
        mainWindow.webContents.send('receive-publish-path', publishPath);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        destroyAllWindow();
        app.quit();
    }
});