/**
 * Electron入口文件
 * @description 多路取证
 * @author Yuet
 */
const fs = require('fs');
const ini = require('ini');
const path = require('path');
const crypto = require('crypto');
const {
    app, ipcMain, BrowserWindow,
    dialog, globalShortcut
} = require('electron');
const yaml = require('js-yaml');
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const mode = process.env['NODE_ENV'];

const KEY = 'az';
let config = {};
let versionFile = '';
let mainWindow = null;
let timerWindow = null;

//#region 读配置文件
if (mode === 'development') {
    versionFile = path.join(__dirname, 'info.dat');
    config = yaml.safeLoad(fs.readFileSync(path.join(app.getAppPath(), 'src/config/ui.yaml'), 'utf8'));
} else {
    versionFile = path.join(__dirname, '../../info.dat');
    try {
        let chunk = fs.readFileSync(path.join(app.getAppPath(), '../config/conf'), 'utf8');
        const decipher = crypto.createDecipher('rc4', KEY);
        let conf = decipher.update(chunk, 'hex', 'utf8');
        conf += decipher.final('utf8');
        config = yaml.safeLoad(conf);
    } catch (error) {
        dialog.showErrorBox('启动失败', '配置文件读取失败，请联系技术支持');
        app.exit(0);
    }
}
//#endregion

notifier = new WindowsBalloon({
    withFallback: false,
    customPath: undefined
});

/**
 * 销毁所有打开的窗口
 */
function destroyAllWindow() {
    if (timerWindow !== null) {
        timerWindow.destroy();
        timerWindow = null;
    }
    if (mainWindow !== null) {
        mainWindow.destroy();
        mainWindow = null;
    }
}

app.on('before-quit', () => {
    //移除mainWindow上的listeners
    mainWindow.removeAllListeners('close');
});


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
            if (timerWindow) {
                timerWindow.reload();
            }
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
            //关闭事件到mainWindow中去处理
            event.preventDefault();
            mainWindow.webContents.send('will-close');
        });

        timerWindow = new BrowserWindow({
            title: '计时服务',
            width: 600, //主窗体宽
            height: 400,//主窗体高
            show: false,
            webPreferences: {
                nodeIntegration: true,
                javascript: true
            }
        });
        timerWindow.loadURL(`file://${path.join(__dirname, './src/renderer/timer/timer.html')}`);
        if (process.env.NODE_ENV === 'development') {
            timerWindow.webContents.openDevTools();
        }

        // if (process.env.NODE_ENV !== 'development') {
        //     //#生产模式屏蔽快捷键
        //     globalShortcut.register('Control+R', () => { });
        //     globalShortcut.register('Control+Shift+R', () => { });
        // }
    });
}

//#region 消息事件

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

//*socket已连接此消息为hprose将废弃
ipcMain.on('socket-connect', (event, uri) => {
    mainWindow.webContents.send('socket-connect', uri);
});

ipcMain.on('do-close', (event) => {
    //mainWindow通知退出程序
    if (process.platform !== 'darwin') {
        globalShortcut.unregisterAll();
        destroyAllWindow();
        app.exit(0);
    }
});

//启动&停止计时
ipcMain.on('time', (event, usb, isStart) => {
    if (timerWindow !== null) {
        timerWindow.webContents.send('time', usb, isStart);
    }
});
//向主窗口发送计时时间 
ipcMain.on('receive-time', (event, usb, timeString) => {
    // console.log(`${usb}:${timeString}`);
    mainWindow.send('receive-time', usb, timeString);
});
//#endregion
