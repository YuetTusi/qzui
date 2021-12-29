const { ipcRenderer } = require('electron');

/**
 * 按USB序号存储采集记录
 * #Map<number, FetchRecord[]>
 */
const dataMap = new Map();

/**
 * 接收采集进度消息
 * @param {number} arg.usb USB序号
 * @param {FetchRecord} arg.fetchRecord FetchRecord记录
 */
const progressHandle = (event, { usb, fetchRecord }) => {
	if (dataMap.has(usb)) {
		dataMap.get(usb).push(fetchRecord);
	} else {
		dataMap.set(usb, [fetchRecord]);
	}
};

/**
 * 获取当前USB序号的采集进度数据
 * @param {number} usb USB序号
 */
const getFetchProgress = (event, usb) => {
	if (dataMap.has(usb)) {
		ipcRenderer.send('receive-fetch-progress', dataMap.get(usb));
	} else {
		ipcRenderer.send('receive-fetch-progress', []);
	}
};

/**
 * 获取当前USB的最后（最新）一条进度消息
 * @param {number} usb USB序号
 */
const getLastProgress = (event, usb) => {
	if (dataMap.has(usb)) {
		let fetchRecords = dataMap.get(usb);
		const count = fetchRecords.length;
		if (count > 0) {
			//取数组中最后一条进度消息
			ipcRenderer.send('receive-fetch-last-progress', {
				usb,
				fetchRecord: fetchRecords[count - 1]
			});
		} else {
			ipcRenderer.send('receive-fetch-last-progress', { usb, fetchRecord: undefined });
		}
	} else {
		ipcRenderer.send('receive-fetch-last-progress', { usb, fetchRecord: undefined });
	}
};

/**
 * 采集完成发送日志数据到mainWindow入库
 * @param event
 * @param usb 完成设备的USB序号
 * @param log 日志对象
 */
const finishHandle = (event, usb, log) => {
	if (dataMap.has(usb)) {
		log.record = dataMap.get(usb).filter((item) => item.type != 0);
	} else {
		log.record = [];
	}
	ipcRenderer.send('save-fetch-log', log);
};

/**
 * 清除USB序号对应的Map数据
 * @param event
 * @param usb 序号
 */
const clearHandle = (event, usb) => dataMap.delete(usb);

ipcRenderer.on('fetch-progress', progressHandle);
ipcRenderer.on('get-fetch-progress', getFetchProgress);
ipcRenderer.on('get-last-progress', getLastProgress);
ipcRenderer.on('fetch-finish', finishHandle);
ipcRenderer.on('progress-clear', clearHandle);
