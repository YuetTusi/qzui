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
        let test = ~~(Math.random() * 1000);
        ipcRenderer.send('receive-parsing-detail', JSON.stringify(test));
        log(phoneParam, test);
        return true;
    } else {
        //当参数为null，终止轮询
        log(phoneParam, null);
        return false;
    }
}

function log(phoneParam, result) {
    let $phoneParam = document.getElementById('phoneParam');
    let $result = document.getElementById('result');
    $phoneParam.innerHTML = JSON.stringify(phoneParam);
    $result.innerText = JSON.stringify(result);
}

ipcRenderer.on('phone-params', (event, args) => {
    phoneParam = args;
    polling(loopHandle, DURATION);
});