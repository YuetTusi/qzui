const { app, ipcMain, BrowserWindow } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const ini = require('ini');
const path = require('path');
const yaml = require('js-yaml');
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const mode = process.env['NODE_ENV'];

const KEY = 'az';
let config = {};
let versionFile = '';
if (mode === 'development') {
    versionFile = path.join(__dirname, 'info.dat');
    config = yaml.safeLoad(fs.readFileSync(path.join(app.getAppPath(), 'src/config/ui.yaml'), 'utf8'));
} else {
    versionFile = path.join(__dirname, '../../info.dat');
    let chunk = fs.readFileSync(path.join(app.getAppPath(), '../config/conf'), 'utf8');
    const decipher = crypto.createDecipher('rc4', KEY);
    let conf = decipher.update(chunk, 'hex', 'utf8');
    conf += decipher.final('utf8');
    config = yaml.safeLoad(conf);
}

let mainWindow = null;

notifier = new WindowsBalloon({
    withFallback: false, // Try Windows Toast and Growl first?
    customPath: undefined
});

/**
 * 销毁所有打开的窗口
 */
function destroyAllWindow() {
    if (mainWindow !== null) {
        mainWindow.destroy();
        mainWindow = null;
    }
}

const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) {
    app.quit(0);
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
            mainWindow.show();
        }
    });

    app.on('ready', () => {
        mainWindow = new BrowserWindow({
            title: config.title || '北京万盛华通科技有限公司',
            width: config.windowWidth || 1200, //主窗体宽
            height: config.windowHeight || 800,//主窗体高
            fullscreen: false,//是否全屏
            autoHideMenuBar: true,//隐藏主窗口菜单
            center: config.center || true,//居中显示
            minHeight: config.minHeight || 800, //最小高度
            minWidth: config.minWidth || 800,//最小宽度
            webPreferences: {
                webSecurity: false,
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
            //读取版本号
            fs.readFile(versionFile, 'utf8', (err, chunk) => {
                if (err) {
                    mainWindow.webContents.send('receive-version', 'V0.0.1');
                } else {
                    let version = Object.keys(ini.parse(chunk))[0].replace(/-/g, '.');
                    mainWindow.webContents.send('receive-version', version);
                }
            });
        });

        mainWindow.on('close', (event) => {
            //阻止事件
            event.preventDefault();
            //发送关闭事件到mainWindow中去处理
            mainWindow.webContents.send('will-close');
        });
    });
}

//显示原生系统消息
ipcMain.on('show-notice', (event, args) => {
    notifier.notify({
        sound: true,
        type: 'info',
        title: args.title || '消息',
        message: args.message || '有消息反馈请查阅'
    });
});
//显示notification消息,参数为消息文本
ipcMain.on('show-notification', (event, args) => {
    mainWindow.webContents.send('show-notification', args);
});

//socket已连接
ipcMain.on('socket-connect', (event, uri) => {
    mainWindow.webContents.send('socket-connect', uri);
});

ipcMain.on('do-close', (event) => {
    //mainWindow通知退出程序
    if (process.platform !== 'darwin') {
        destroyAllWindow();
        app.exit(0);
    }
});

app.on('before-quit', () => {
    //退出前要移除所有mainWindow上的监听，否则有误
    mainWindow.removeAllListeners('close');
});
