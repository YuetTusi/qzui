const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');

var phoneParam = null; //将参数保存为全局，以避免闭包记忆的影响

/**
 * 轮询
 */
function loopHandle() {
    if (phoneParam) {
        console.log(phoneParam);
        return true
    } else {
        //当参数为null，终止轮询
        return false;
    }
}

ipcRenderer.on('phone-params', (event, args) => {
    phoneParam = args;
    polling(loopHandle);
});