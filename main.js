/**
 * Electron入口文件
 * @description 多路取证
 * @author Yuet
 */
const path = require('path');
const { app, ipcMain, BrowserWindow, dialog, globalShortcut, Menu, shell } = require('electron');
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const express = require('express');
const cors = require('cors');
const { Db, getDb } = require('./src/main/db');
const { loadConf, existManufaturer, readAppName, runProc } = require('./src/main/utils');
const api = require('./src/main/api');

const mode = process.env['NODE_ENV'];
const appPath = app.getAppPath();
const server = express();

let config = null;
let existManuJson = false;
let mainWindow = null;
let timerWindow = null; //计时
let sqliteWindow = null; //SQLite查询
let fetchRecordWindow = null; //采集记录
let reportWindow = null; //报告
let protocolWindow = null; //协议阅读
let fetchProcess = null; //采集进程
let parseProcess = null; //解析进程
let yunProcess = null; //云取服务进程
let httpServerIsRunning = false; //是否已启动HttpServer
global.Db = Db;
global.getDb = getDb;

app.allowRendererProcessReuse = false;
if (mode !== 'development') {
	//生产模式禁用硬件加速
	app.disableHardwareAcceleration();
}

config = loadConf(mode, appPath);
existManuJson = existManufaturer(mode, appPath);
if (config === null) {
	dialog.showErrorBox('启动失败', '配置文件读取失败, 请联系技术支持');
	app.exit(0);
}
if (!existManuJson) {
	dialog.showErrorBox('启动失败', 'manufaturer配置读取失败, 请联系技术支持');
	app.exit(0);
}
const appName = readAppName();

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
	if (protocolWindow !== null) {
		protocolWindow.destroy();
		protocolWindow = null;
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
		if (yunProcess !== null) {
			yunProcess.kill(); //杀掉云服务进程
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
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		sqliteWindow.loadFile(path.join(__dirname, './src/renderer/sqlite/sqlite.html'));

		mainWindow = new BrowserWindow({
			title: appName ?? '北京万盛华通科技有限公司',
			icon: config.logo ? path.join(appPath, `../config/${config.logo}`) : undefined,
			width: config.windowWidth ?? 1280, //主窗体宽
			height: config.windowHeight ?? 800, //主窗体高
			autoHideMenuBar: true, //隐藏主窗口菜单
			center: config.center ?? true, //居中显示
			minHeight: config.minHeight ?? 768, //最小高度
			minWidth: config.minWidth ?? 960, //最小宽度
			backgroundColor: '#d3deef',
			webPreferences: {
				enableRemoteModule: true,
				webSecurity: false,
				contextIsolation: false,
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
			if (config.max <= 2) {
				//采集路数为2路以下，默认最大化窗口
				mainWindow.maximize();
			}
			mainWindow.loadFile(path.join(__dirname, config.publishPage));
		}

		mainWindow.webContents.on('did-finish-load', () => {
			mainWindow.show();
			if (timerWindow) {
				timerWindow.reload();
			}
			if (!httpServerIsRunning) {
				//启动HTTP服务
				server.use(api(mainWindow.webContents));
				server.listen(config.httpPort ?? 9900, () => {
					httpServerIsRunning = true;
					console.log(`HTTP服务启动在端口${config.httpPort ?? 9900}`);
				});
			}
		});

		mainWindow.webContents.addListener('new-window', (event) => event.preventDefault());

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
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		timerWindow.loadFile(path.join(__dirname, './src/renderer/timer/timer.html'));

		fetchRecordWindow = new BrowserWindow({
			width: 600,
			height: 400,
			show: false,
			webPreferences: {
				contextIsolation: false,
				enableRemoteModule: true,
				nodeIntegration: true,
				javascript: true
			}
		});
		fetchRecordWindow.loadFile(
			path.join(__dirname, './src/renderer/fetchRecord/fetchRecord.html')
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

//启动后台服务（采集，解析，云取证）
ipcMain.on('run-service', (event) => {
	runProc(
		fetchProcess,
		config.fetchExe ?? 'n_fetch.exe',
		path.join(appPath, '../../../', config.fetchPath ?? './n_fetch')
	);
	runProc(
		parseProcess,
		config.parseExe ?? 'parse.exe',
		path.join(appPath, '../../../', config.parsePath ?? './parse')
	);
	if (config.useServerCloud) {
		//有云取功能，调起云RPC服务
		runProc(
			yunProcess,
			config.yqExe ?? 'yqRPC.exe',
			path.join(appPath, '../../../', config.yqPath ?? './yq'),
			['-config', './agent.json', '-log_dir', './log']
		);
	}
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
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		reportWindow.loadFile(path.join(__dirname, './src/renderer/report/report.html'));
		reportWindow.webContents.openDevTools();
		reportWindow.webContents.once('did-finish-load', () => {
			reportWindow.webContents.send('report-export', exportCondition, treeParams, msgId);
		});
	} else {
		reportWindow.webContents.send('report-export', exportCondition, treeParams, msgId);
	}
});
//导出报告（批量）
ipcMain.on('report-batch-export', (event, batchExportTasks, isAttach, isZip, msgId) => {
	if (reportWindow === null) {
		reportWindow = new BrowserWindow({
			title: '报告导出',
			width: 800,
			height: 600,
			show: false,
			webPreferences: {
				enableRemoteModule: false,
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		reportWindow.loadFile(path.join(__dirname, './src/renderer/report/report.html'));
		reportWindow.webContents.openDevTools();
		reportWindow.webContents.once('did-finish-load', () => {
			reportWindow.webContents.send(
				'report-batch-export',
				batchExportTasks,
				isAttach,
				isZip,
				msgId
			);
		});
	} else {
		reportWindow.webContents.send(
			'report-batch-export',
			batchExportTasks,
			isAttach,
			isZip,
			msgId
		);
	}
});

ipcMain.on('update-export-msg', (event, args) => {
	mainWindow.webContents.send('update-export-msg', args);
});

//导出报告完成
ipcMain.on('report-export-finish', (event, success, exportCondition, isBatch, msgId) => {
	if (reportWindow !== null) {
		reportWindow.destroy();
		reportWindow = null;
	}
	shell.beep();
	mainWindow.setProgressBar(0, {
		mode: 'none'
	});
	mainWindow.webContents.send('report-export-finish', success, exportCondition, isBatch, msgId);
});

//显示阅读协议
ipcMain.on('show-protocol', (event, fetchData) => {
	if (protocolWindow === null) {
		protocolWindow = new BrowserWindow({
			width: 800,
			height: 350,
			show: true,
			frame: false,
			resizable: false,
			closable: false,
			alwaysOnTop: true,
			parent: mainWindow,
			modal: true,
			webPreferences: {
				enableRemoteModule: true,
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		protocolWindow.loadFile(path.join(__dirname, './src/renderer/protocol/protocol.html'));
		protocolWindow.webContents.on('did-finish-load', () =>
			protocolWindow.send('show-protocol', fetchData)
		);
	} else {
		protocolWindow.show();
		protocolWindow.send('show-protocol', fetchData);
	}
});

//阅读协议同意反馈
ipcMain.on('protocol-read', (event, fetchData, agree) => {
	mainWindow.send('protocol-read', fetchData, agree);
	if (protocolWindow !== null) {
		protocolWindow.destroy();
		protocolWindow = null;
	}
});
//#endregion
