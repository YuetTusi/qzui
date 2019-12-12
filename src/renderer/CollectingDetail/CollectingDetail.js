const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');
const Rpc = require('../scripts/rpc');
const Reply = require('../scripts/reply');
const log = require('../scripts/log');

const DURATION = 500;
var phoneParam = null; //将参数保存为全局，以避免闭包记忆的影响
var rpc = null;
var replay = null;

if (rpc === null) {
    rpc = new Rpc();
}

if (replay === null) {
    reply = new Reply([
        function collectBack(phoneInfo) {

            phoneParam = null;
            let result = {
                ...phoneInfo,
                m_strDescription: '手机数据已采集完毕'
            };
            ipcRenderer.send('receive-collecting-detail', JSON.stringify(result));
            return true;
        }
    ], 8089);
}

/**
 * 轮询
 */
async function loopHandle() {
    if (phoneParam) {
        const { piSerialNumber, piLocationID } = phoneParam;
        try {
            let result = await rpc.invoke("GetFetchDesc", [piSerialNumber + piLocationID]);
            console.log(result);
            ipcRenderer.send('receive-collecting-detail', JSON.stringify(result));
            if (result.m_spif.m_ConnectSate === 3) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.log('采集详情获取失败...');
            console.log(`@renderer/CollectingDetail.js/loopHandle: ${error.message}`);
            log.error({ message: `@renderer/CollectingDetail.js/loopHandle: ${error.message}` });
            return false;
        }
    } else {
        //当参数为null，终止轮询
        return false;
    }
}

ipcRenderer.on('phone-params', (event, args) => {
    phoneParam = args;
    polling(loopHandle, DURATION);
});