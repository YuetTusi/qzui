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
    console.log(phoneParam);
    if (phoneParam) {
        ipcRenderer.send('receive-parsing-detail', JSON.stringify(~~(Math.random() * 1000)));
        return true;
    } else {
        //当参数为null，终止轮询
        return false;
    }
}

ipcRenderer.on('phone-params', (event, args) => {
    phoneParam = args;
    polling(loopHandle, DURATION);
});