const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./src/config/ui.config');
const WindowsBalloon = require('node-notifier').WindowsBalloon;

let mainWindow = null;
let connectRemoteWindow = null;
let collectingDetailWindow = null;
let parsingDetailWindow = null;

notifier = new WindowsBalloon({
    withFallback: false, // Try Windows Toast and Growl first?
    customPath: undefined
});

/**
 * 销毁所有打开的窗口
 */
function destroyAllWindow() {
    if (connectRemoteWindow !== null) {
        connectRemoteWindow.close();
        connectRemoteWindow = null;
    }
    if (collectingDetailWindow !== null) {
        collectingDetailWindow.close();
        collectingDetailWindow = null;
    }
    if (parsingDetailWindow !== null) {
        parsingDetailWindow.close();
        parsingDetailWindow = null;
    }
    if (mainWindow !== null) {
        mainWindow.close();
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
    mainWindow.webContents.on('did-finish-load', () => {
        if (connectRemoteWindow === null) {
            connectRemoteWindow = new BrowserWindow({
                show: config.isShowRenderer,
                webPreferences: {
                    nodeIntegration: true
                }
            });
            connectRemoteWindow.webContents.openDevTools();
            connectRemoteWindow.loadFile(path.resolve(__dirname, './src/renderer/ConnectRemoteCall/ConnectRemoteCall.html'));
        } else {
            connectRemoteWindow.reload();
        }
    });

    mainWindow.on('closed', () => {
        destroyAllWindow();
        app.exit(0);
    });
});

//显示原生系统消息
ipcMain.on('show-notice', (event, args) => {

    notifier.notify({
        sound: true,
        type: 'info',
        title: args.title || '消息',
        message: args.message || '有消息反馈请查阅'
    });
});

//反馈RPC连接状态（ture为连接上）
ipcMain.on('receive-connect-rpc', (event, args) => {
    mainWindow.webContents.send('receive-connect-rpc', args);
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