/**
 * Electron入口文件
 * @description 多路取证
 * @author Yuet
 */
const path = require('path');
const {
	app,
	ipcMain,
	BrowserWindow,
	dialog,
	globalShortcut,
	Menu,
	MenuItem,
	shell
} = require('electron');
const { WindowsBalloon } = require('node-notifier');
const cors = require('cors');
const ejs = require('ejs');
const express = require('express');
const log = require('./src/renderer/log');
const { getConfigMenuConf } = require('./src/main/menu');
const {
	loadConf,
	existManufaturer,
	readManufaturer,
	runProc,
	isWin7,
	portStat,
	writeNetJson
} = require('./src/main/utils');
const {
	all,
	find,
	findOne,
	findByPage,
	count,
	insert,
	remove,
	update
} = require('./src/main/db-handle');

const api = require('./src/main/api');
const mode = process.env['NODE_ENV'];
const { resourcesPath } = process;
const cwd = process.cwd();
const appPath = app.getAppPath();
const server = express();

let httpPort = 9900;
let config = null;
let useHardwareAcceleration = false; //是否使用硬件加速
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
let appQueryProcess = null; //应用痕迹进程
let quickFetchProcess = null; //快速点验进程
let httpServerIsRunning = false; //是否已启动HttpServer

config = loadConf(mode, appPath);
useHardwareAcceleration = config?.useHardwareAcceleration ?? !isWin7();
existManuJson = existManufaturer(mode, appPath);
if (config === null) {
	dialog.showErrorBox('启动失败', '配置文件读取失败, 请联系技术支持');
	app.exit(0);
}
if (!existManuJson) {
	dialog.showErrorBox('启动失败', 'manufaturer配置读取失败, 请联系技术支持');
	app.exit(0);
}
if (!useHardwareAcceleration) {
	//# Win7默认禁用硬件加速，若conf文件中有此项以配置则以配置为准
	app.disableHardwareAcceleration();
	app.commandLine.appendSwitch('disable-gpu');
}
const manu = readManufaturer();

var notifier = new WindowsBalloon({
	withFallback: false,
	customPath: undefined
});

//# 配置Http服务器相关
server.use(express.json());
server.use(express.urlencoded());
server.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST'],
		optionsSuccessStatus: 200
	})
);
server.engine('html', ejs.renderFile);
server.set('views', path.join(__dirname, 'src/ejs'));
server.set('view engine', 'ejs');

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
		if (appQueryProcess !== null) {
			appQueryProcess.kill(); //杀掉应用痕迹进程
		}
		if (quickFetchProcess !== null) {
			quickFetchProcess.kill();	//杀掉快速点验进程
		}
		app.exit(0);
	}
}

process.on('uncaughtException', (err) => {
	log.error(`main.js UncaughtException: ${err.stack}`);
	app.exit(1);
});

app.on('before-quit', () =>
	//移除mainWindow上的listeners
	mainWindow.removeAllListeners('close')
);

app.on('render-process-gone', (event, webContents, { reason, exitCode }) =>
	log.error(`main.js RenderProcessGone: ${JSON.stringify({ reason, exitCode })}`)
);

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
		(async () => {
			if (!httpServerIsRunning) {
				try {
					httpPort = await portStat(config.httpPort ?? 9900);
					//启动HTTP服务
					server.use(api(mainWindow.webContents));
					server.listen(httpPort, () => {
						httpServerIsRunning = true;
						console.log(`HTTP服务启动在端口${httpPort}`);
					});
				} catch (error) {
					console.log(`HTTP服务启动失败:${error.message}`);
				}
			}
		})();

		sqliteWindow = new BrowserWindow({
			title: 'SQLite',
			width: 600,
			height: 400,
			show: false,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		sqliteWindow.loadFile(path.join(__dirname, './src/renderer/sqlite/sqlite.html'));
		if (mode === 'development') {
			sqliteWindow.openDevTools();
		}

		mainWindow = new BrowserWindow({
			title: `${manu?.materials_name ?? '智能终端快速取证'}(${
				manu?.materials_software_version ?? ''
			})`,
			icon: config.logo ? path.join(appPath, `../config/${config.logo}`) : undefined,
			width: config.windowWidth ?? 1280, //主窗体宽
			height: config.windowHeight ?? 800, //主窗体高
			autoHideMenuBar: true, //隐藏主窗口菜单
			center: config.center ?? true, //居中显示
			minHeight: config.minHeight ?? 768, //最小高度
			minWidth: config.minWidth ?? 960, //最小宽度
			backgroundColor: '#d3deef',
			webPreferences: {
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
			if (config.max <= 2) {
				//采集路数为2路以下，默认最大化窗口
				mainWindow.maximize();
			}
			mainWindow.loadFile(path.join(resourcesPath, 'app.asar.unpacked/dist/default.html'));
		}

		mainWindow.webContents.on('did-finish-load', async () => {
			mainWindow.show();
			mainWindow.webContents.send('hardware-acceleration', useHardwareAcceleration); //测试代码，以后会删除
			if (timerWindow) {
				timerWindow.reload();
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
		if (mode === 'development') {
			timerWindow.openDevTools();
		}

		fetchRecordWindow = new BrowserWindow({
			width: 600,
			height: 400,
			show: false,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		fetchRecordWindow.loadFile(
			path.join(__dirname, './src/renderer/fetchRecord/fetchRecord.html')
		);
		if (mode === 'development') {
			fetchRecordWindow.openDevTools();
		}

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
ipcMain.on('show-notice', (event, { title, message }) =>
	notifier.notify({
		sound: true,
		type: 'info',
		title: title || '消息',
		message: message || '有消息反馈请查阅'
	})
);

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
ipcMain.on('do-relaunch', () => {
	app.relaunch();
	exitApp(process.platform);
});

//启动后台服务（采集，解析，云取证）
ipcMain.on('run-service', () => {
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
	if (config.useTraceLogin) {
		//有应用痕迹查询，调起服务
		runProc(
			appQueryProcess,
			config.appQueryExe ?? 'AppQuery.exe',
			path.join(appPath, '../../../', config.appQueryPath ?? './AppQuery')
		);
	}
	if (config.useQuickFetch) {
		//有快速点验功能，调起服务
		runProc(
			quickFetchProcess,
			config.quickFetchExe ?? 'QuickFetchServer.exe',
			path.join(appPath, '../../../', config.quickFetchPath ?? './QuickFetch')
		);
	}
});

//退出应用
ipcMain.on(
	'do-close',
	(
		event //mainWindow通知退出程序
	) => exitApp(process.platform)
);

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
//向主窗口发送采集结束以停止计时
ipcMain.on('fetch-over', (event, usb) => {
	if (mainWindow && mainWindow.webContents !== null) {
		mainWindow.webContents.send('fetch-over', usb);
	}
});
//执行SQLite查询单位表
ipcMain.on('query-db', (event, ...args) => sqliteWindow.webContents.send('query-db', args));
//SQLite查询结果
ipcMain.on('query-db-result', (event, result) =>
	mainWindow.webContents.send('query-db-result', result)
);

//发送进度消息
ipcMain.on('fetch-progress', (event, arg) => {
	fetchRecordWindow.webContents.send('fetch-progress', arg);
	mainWindow.webContents.send('fetch-progress', arg);
});
//采集完成发送USB号及日志数据
ipcMain.on('fetch-finish', (event, usb, log) =>
	fetchRecordWindow.webContents.send('fetch-finish', usb, log)
);
//清除usb序号对应的采集记录
ipcMain.on('progress-clear', (event, usb) =>
	fetchRecordWindow.webContents.send('progress-clear', usb)
);
//获取当前USB序号的采集进度数据
ipcMain.on('get-fetch-progress', (event, usb) =>
	fetchRecordWindow.webContents.send('get-fetch-progress', usb)
);
//获取当前USB序号最新一条进度消息
ipcMain.on('get-last-progress', (event, usb) =>
	fetchRecordWindow.webContents.send('get-last-progress', usb)
);
//消息发回LiveModal以显示采集进度
ipcMain.on('receive-fetch-progress', (event, fetchRecords) =>
	mainWindow.webContents.send('receive-fetch-progress', fetchRecords)
);
//消息发回FetchInfo.tsx组件以显示最新一条进度
ipcMain.on('receive-fetch-last-progress', (event, fetchRecord) =>
	mainWindow.webContents.send('receive-fetch-last-progress', fetchRecord)
);
//将FetchLog数据发送给入库
ipcMain.on('save-fetch-log', (event, log) => mainWindow.webContents.send('save-fetch-log', log));

//导出报告
ipcMain.on('report-export', (event, exportCondition, treeParams, msgId) => {
	if (reportWindow === null) {
		reportWindow = new BrowserWindow({
			title: '报告导出',
			width: 800,
			height: 600,
			show: false,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		reportWindow.loadFile(path.join(__dirname, './src/renderer/report/report.html'));
		if (mode === 'development') {
			reportWindow.webContents.openDevTools();
		}
		reportWindow.webContents.once('did-finish-load', () =>
			reportWindow.webContents.send('report-export', exportCondition, treeParams, msgId)
		);
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
				contextIsolation: false,
				nodeIntegration: true,
				javascript: true
			}
		});
		reportWindow.loadFile(path.join(__dirname, './src/renderer/report/report.html'));
		reportWindow.webContents.openDevTools();
		reportWindow.webContents.once('did-finish-load', () =>
			reportWindow.webContents.send(
				'report-batch-export',
				batchExportTasks,
				isAttach,
				isZip,
				msgId
			)
		);
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

ipcMain.on('update-export-msg', (event, args) =>
	mainWindow.webContents.send('update-export-msg', args)
);

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

//左上角右键菜单
ipcMain.on('create-setting-menu', (event, position) => {
	const menu = new Menu();
	getConfigMenuConf(mainWindow.webContents).forEach((menuItem) => {
		menu.append(new MenuItem({ ...menuItem }));
	});
	menu.popup(position);
});

//#endregion

//#region Nedb Handle

ipcMain.handle('db-all', all);
ipcMain.handle('db-find', find);
ipcMain.handle('db-find-one', findOne);
ipcMain.handle('db-find-by-page', findByPage);
ipcMain.handle('db-count', count);
ipcMain.handle('db-insert', insert);
ipcMain.handle('db-remove', remove);
ipcMain.handle('db-update', update);

//#endregion

ipcMain.handle('get-path', (event, type) => app.getPath(type));
ipcMain.handle('open-dialog', (event, options) => dialog.showOpenDialog(options));
ipcMain.handle('open-dialog-sync', (event, options) => dialog.showOpenDialogSync(options));
ipcMain.handle('write-net-json', (event, servicePort) =>
	writeNetJson(cwd, { apiPort: httpPort, servicePort })
);
