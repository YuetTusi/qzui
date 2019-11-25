const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');
const Rpc = require('../scripts/rpc');

const DURATION = 500;
var phoneParam = null; //将参数保存为全局，以避免闭包记忆的影响
var rpc = new Rpc();

/**
 * 轮询
 */
async function loopHandle() {
    if (phoneParam) {
        const { piSerialNumber, piLocationID } = phoneParam;
        try {
            let result = await rpc.invoke("GetFetchDesc", [piSerialNumber + piLocationID]);
            console.log(result);
            if (result.m_spif.m_ConnectSate === 3) {
                return false;
            } else {
                ipcRenderer.send('receive-collecting-detail', JSON.stringify(result));
                return true;
            }
        } catch (error) {
            console.log('采集详情获取失败...');
            console.log(`@renderer/CollectingDetail.js/loopHandle: ${error.message}`);
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