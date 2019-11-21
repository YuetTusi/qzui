const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');

const DURATION = 500;
var phoneParam = null; //将参数保存为全局，以避免闭包记忆的影响


/**
 * 轮询
 */
async function loopHandle() {
    if (phoneParam) {
        console.log(phoneParam);

        ipcRenderer.send('receive-collecting-detail', Math.random());
        return Promise.resolve(true);
    } else {
        //当参数为null，终止轮询
        return Promise.resolve(false);
    }
}

ipcRenderer.on('phone-params', (event, args) => {
    phoneParam = args;
    polling(loopHandle, DURATION);
});