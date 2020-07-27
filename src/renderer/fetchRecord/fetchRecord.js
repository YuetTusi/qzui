const { ipcRenderer } = require('electron');

const dataMap = new Map();//按USB序号存储采集记录

/**
 * 接收采集进度消息
 * @param {*} event 
 * @param {*} arg {arg.usb序号，arg.fetchRecord FetchRecord记录}
 */
const progressHandle = (event, arg) => {

    //TODO: 用arg.usb序号来做分组，寄存数据，建议使用Map结构
    //TODO: 用户点开时使用当前USB序号过滤显示内容
    //TODO: 采集完成时，入库，并清空对应的USB序号数据

    if (dataMap.has(arg.usb)) {
        dataMap.get(arg.usb).push(arg.fetchRecord);
    } else {
        dataMap.set(arg.usb, [arg.fetchRecord]);
    }
};

/**
 * 获取当前USB序号的采集进度数据
 * @param {*} event 
 * @param {*} usb USB序号
 */
const getFetchProgress = (event, usb) => {
    if (dataMap.has(usb)) {
        ipcRenderer.send('receive-fetch-progress', dataMap.get(usb));
    } else {
        ipcRenderer.send('receive-fetch-progress', []);
    }
};

/**
 * 采集完成发送日志数据到mainWindow入库
 * @param event 
 * @param usb 完成设备的USB序号 
 * @param log 日志对象
 */
const finishHandle = async (event, usb, log) => {

    if (dataMap.has(usb)) {
        log.record = dataMap.get(usb).filter(item => item.type != 0);
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
const clearHandle = (event, usb) => {
    dataMap.delete(usb);
};

ipcRenderer.on('fetch-progress', progressHandle);
ipcRenderer.on('get-fetch-progress', getFetchProgress);
ipcRenderer.on('fetch-finish', finishHandle);
ipcRenderer.on('progress-clear', clearHandle);