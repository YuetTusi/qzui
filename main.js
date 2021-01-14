/**
 * Electron入口文件
 * @description 多路取证
 * @author Yuet
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { app, ipcMain, BrowserWindow, dialog, globalShortcut, Menu, shell } = require('electron');
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const yaml = require('js-yaml');
const express = require('express');
const cors = require('cors');
const { Db, getDb } = require('./db');
const { readAppName } = require('./utils');
const api = require('./api');

const KEY = 'az';
const mode = process.env['NODE_ENV'];
const appPath = app.getAppPath();
const server = express();

let config = {};
let mainWindow = null;
let timerWindow = null; //计时
let sqliteWindow = null; //SQLite查询
let fetchRecordWindow = null; //采集记录
let reportWindow = null; //报告
let fetchProcess = null; //采集进程
let parseProcess = null; //解析进程
let httpServerIsRunning = false; //是否已启动HttpServer
global.Db = Db;
global.getDb = getDb;

app.allowRendererProcessReuse = false;

//#region 读配置文件&应用名称
if (mode === 'development') {
	config = yaml.safeLoad(fs.readFileSync(path.join(appPath, 'src/config/ui.yaml'), 'utf8'));
} else {
	try {
		let chunk = fs.readFileSync(path.join(appPath, '../config/conf'), 'utf8');
		const decipher = crypto.createDecipher('rc4', KEY);
		let conf = decipher.update(chunk, 'hex', 'utf8');
		conf += decipher.final('utf8');
		config = yaml.safeLoad(conf);
	} catch (error) {
		dialog.showErrorBox('启动失败', '配置文件读取失败，请联系技术支持');
		app.exit(0);
	}
}
const appName = readAppName();
//#endregion

var notifier = new WindowsBalloon({
	withFallback: false,
	customPath: undefined
});

//# 配置Http服务器相关
server.use(express.json());
server.use(cors({ optionsSuccessStatus: 200 }));

/**
 * 销毁所有窗口
 */
function destroyAllWindow() {
	if (reportWindow !== null) {
		reportWindow.destroy();
		reportWindow = null;
	}
	if (fetchRecordWindow !== null) {
		fetchRecordWindow.destroy();
		fetchRecordWindow = null;
	}
	if (sqliteWindow !== null) {
		sqliteWindow.destroy();
		sqliteWindow = null;
	}
	if (timerWindow !== null) {
		timerWindow.destroy();
		timerWindow = null;
	}
	if (mainWindow !== null) {
		mainWindow.destroy();
		mainWindow = null;
	}
}

/**
 * 退出应用
 */
function exitApp(platform) {
	if (platform !== 'darwin') {
		globalShortcut.unregisterAll();
		destroyAllWindow();
		if (fetchProcess !== null) {
			fetchProcess.kill(); //杀掉采集进程
		}
		if (parseProcess !== null) {
			parseProcess.kill(); //杀掉解析进程
		}
		app.exit(0);
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
		//单例应用
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}
			mainWindow.focus();
			mainWindow.show();
		}
	});

	app.on('ready', () => {
		sqliteWindow = new BrowserWindow({
			title: 'SQLite',
			width: 600,
			height: 400,
			show: false,
			webPreferences: {
				enableRemoteModule: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		sqliteWindow.loadURL(`file://${path.join(__dirname, './src/renderer/sqlite/sqlite.html')}`);

		mainWindow = new BrowserWindow({
			title: appName || '北京万盛华通科技有限公司',
			icon: config.logo ? path.join(appPath, `../config/${config.logo}`) : undefined,
			width: config.windowWidth || 1280, //主窗体宽
			height: config.windowHeight || 800, //主窗体高
			fullscreen: false, //是否全屏
			autoHideMenuBar: true, //隐藏主窗口菜单
			center: config.center || true, //居中显示
			minHeight: config.minHeight || 768, //最小高度
			minWidth: config.minWidth || 960, //最小宽度
			webPreferences: {
				enableRemoteModule: true,
				webSecurity: false,
				nodeIntegration: true,
				javascript: true
			}
		});

		if (mode === 'development') {
			mainWindow.webContents.openDevTools();
			mainWindow.loadURL(config.devPageUrl);
		} else {
			if (!config.publishPage) {
				config.publishPage = './dist/index.html';
			}
			if (config.max === 2) {
				//2路默认最大化显示
				mainWindow.maximize();
			}
			mainWindow.loadURL(`file://${path.join(__dirname, config.publishPage)}`);
		}

		mainWindow.webContents.on('did-finish-load', () => {
			mainWindow.show();
			if (timerWindow) {
				timerWindow.reload();
			}
			if (sqliteWindow) {
				sqliteWindow.reload();
			}
			if (fetchRecordWindow) {
				fetchRecordWindow.reload();
			}

			fetchProcess = spawn(config.fetchExe || 'n_fetch.exe', {
				cwd: path.join(appPath, '../../../', config.fetchPath)
			});
			fetchProcess.once('error', () => {
				console.log('采集程序启动失败');
				fetchProcess = null;
			});
			parseProcess = spawn(config.parseExe || 'parse.exe', {
				cwd: path.join(appPath, '../../../', config.parsePath)
			});
			parseProcess.once('error', () => {
				console.log('解析程序启动失败');
				parseProcess = null;
			});

			if (!httpServerIsRunning) {
				//启动HTTP服务
				server.use(api(mainWindow.webContents));
				server.listen(config.httpPort || 9900, () => {
					httpServerIsRunning = true;
					console.log(`HTTP服务启动在端口${config.httpPort || 9900}`);
				});
			}
		});

		mainWindow.webContents.on('new-window', (event) => event.preventDefault());

		mainWindow.on('close', (event) => {
			//关闭事件到mainWindow中去处理
			event.preventDefault();
			mainWindow.webContents.send('will-close');
		});

		timerWindow = new BrowserWindow({
			title: '计时服务',
			width: 600,
			height: 400,
			show: false,
			webPreferences: {
				nodeIntegration: true,
				javascript: true
			}
		});
		timerWindow.loadURL(`file://${path.join(__dirname, './src/renderer/timer/timer.html')}`);

		fetchRecordWindow = new BrowserWindow({
			width: 600,
			height: 400,
			show: false,
			webPreferences: {
				enableRemoteModule: true,
				nodeIntegration: true,
				javascript: true
			}
		});
		fetchRecordWindow.loadURL(
			`file://${path.join(__dirname, './src/renderer/fetchRecord/fetchRecord.html')}`
		);

		if (mode === 'development') {
			timerWindow.webContents.openDevTools();
			sqliteWindow.webContents.openDevTools();
			fetchRecordWindow.webContents.openDevTools();
		}

		// #生产模式屏蔽快捷键（发布把注释放开）
		if (mode !== 'development') {
			globalShortcut.register('Control+R', () => {});
			globalShortcut.register('Control+Shift+R', () => {});
			globalShortcut.register('CommandOrControl+Shift+I', () => {});
		}
		// #默认菜单置空（发布把注释放开）
		if (mode !== 'development') {
			Menu.setApplicationMenu(null);
		}
	});
}

//#region 消息事件

//显示原生系统消息
ipcMain.on('show-notice', (event, args) => {
	const { title, message } = args;
	notifier.notify({
		sound: true,
		type: 'info',
		title: title || '消息',
		message: message || '有消息反馈请查阅'
	});
});

//显示notification消息,参数为消息文本
ipcMain.on('show-notification', (event, args) => {
	mainWindow.webContents.send('show-notification', args);
});

//显示窗口进度
ipcMain.on('show-progress', (event, show) => {
	if (show) {
		mainWindow.setProgressBar(1, {
			mode: 'indeterminate'
		});
	} else {
		mainWindow.setProgressBar(0, {
			mode: 'none'
		});
	}
});

/**
 * 重启应用
 */
ipcMain.on('do-relaunch', (event) => {
	app.relaunch();
	exitApp(process.platform);
});

//退出应用
ipcMain.on('do-close', (event) => {
	//mainWindow通知退出程序
	exitApp(process.platform);
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
	if (mainWindow && mainWindow.webContents !== null) {
		mainWindow.webContents.send('receive-time', usb, timeString);
	}
});
//执行SQLite查询单位表
ipcMain.on('query-db', (event, ...args) => {
	sqliteWindow.webContents.send('query-db', args);
});
//SQLite查询结果
ipcMain.on('query-db-result', (event, result) => {
	mainWindow.webContents.send('query-db-result', result);
});

//发送进度消息
ipcMain.on('fetch-progress', (event, arg) => {
	fetchRecordWindow.webContents.send('fetch-progress', arg);
});
//采集完成发送USB号及日志数据
ipcMain.on('fetch-finish', (event, usb, log) => {
	fetchRecordWindow.webContents.send('fetch-finish', usb, log);
});
//清除usb序号对应的采集记录
ipcMain.on('progress-clear', (event, usb) => {
	fetchRecordWindow.webContents.send('progress-clear', usb);
});
//获取当前USB序号的采集进度数据
ipcMain.on('get-fetch-progress', (event, usb) => {
	fetchRecordWindow.webContents.send('get-fetch-progress', usb);
});
//获取当前USB序号最新一条进度消息
ipcMain.on('get-last-progress', (event, usb) => {
	fetchRecordWindow.webContents.send('get-last-progress', usb);
});
//消息发回LiveModal以显示采集进度
ipcMain.on('receive-fetch-progress', (event, fetchRecords) => {
	mainWindow.webContents.send('receive-fetch-progress', fetchRecords);
});
//消息发回FetchInfo.tsx组件以显示最新一条进度
ipcMain.on('receive-fetch-last-progress', (event, fetchRecord) => {
	mainWindow.webContents.send('receive-fetch-last-progress', fetchRecord);
});
//将FetchLog数据发送给入库
ipcMain.on('save-fetch-log', (event, log) => {
	mainWindow.webContents.send('save-fetch-log', log);
});

//导出报告
ipcMain.on('report-export', (event, exportCondition, treeParams, msgId) => {
	if (reportWindow === null) {
		reportWindow = new BrowserWindow({
			title: '报告导出',
			width: 800,
			height: 600,
			show: false,
			webPreferences: {
				enableRemoteModule: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		reportWindow.loadURL(`file://${path.join(__dirname, './src/renderer/report/report.html')}`);
		reportWindow.webContents.openDevTools();
		reportWindow.webContents.once('did-finish-load', () => {
			reportWindow.webContents.send('report-export', exportCondition, treeParams, msgId);
		});
	} else {
		reportWindow.webContents.send('report-export', exportCondition, treeParams, msgId);
	}
});

//导出报告完成
ipcMain.on('report-export-finish', (event, success, exportCondition, msgId) => {
	if (reportWindow !== null) {
		reportWindow.destroy();
		reportWindow = null;
	}
	shell.beep();
	mainWindow.setProgressBar(0, {
		mode: 'none'
	});
	mainWindow.webContents.send('report-export-finish', success, exportCondition, msgId);
});
//#endregion
