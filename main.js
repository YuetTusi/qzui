const { app, dialog, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./src/config/ui.config');
const WindowsBalloon = require('node-notifier').WindowsBalloon;

let mainWindow = null;

notifier = new WindowsBalloon({
    withFallback: false, // Try Windows Toast and Growl first?
    customPath: undefined
});

/**
 * 销毁所有打开的窗口
 */
function destroyAllWindow() { }

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
    // mainWindow.webContents.on('did-finish-load', () => { });

    mainWindow.on('close', (event) => {
        let clickIndex = dialog.showMessageBoxSync(mainWindow, {
            type: 'question',
            title: '程序将退出',
            message: '确认退出取证程序吗？',
            buttons: ['是', '否'],
            cancelId: -1
        });
        if (clickIndex === -1 || clickIndex === 1) {
            event.preventDefault();
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

//取得发布目录
ipcMain.on('publish-path', (event, args) => {
    const publishPath = path.join(__dirname);
    if (mainWindow) {
        mainWindow.webContents.send('receive-publish-path', publishPath);
    }
});

//RPC Socket断开
ipcMain.on('socket-disconnected', (event, errorMessage, uri) => {
    mainWindow.webContents.send('socket-disconnected', uri);
});

app.on('before-quit', () => {
    //退出前要移除所有mainWindow上的监听，否则有误
    mainWindow.removeAllListeners('closed');
    mainWindow = null;
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.exit(0);
    }
});