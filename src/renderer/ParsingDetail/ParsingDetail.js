const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');
const Rpc = require('../scripts/rpc');


const DURATION = 500;
const rpc = new Rpc('tcp4://192.168.1.35:60000/');
var phoneParam = null; //将参数保存为全局，以避免闭包记忆的影响

/**
 * 轮询
 */
async function loopHandle() {

    if (phoneParam) {
        let data = [
            { strCase_: '诈骗案', strPhone_: '13911520108', status_: 1 },
            { strCase_: '诈骗案', strPhone_: '15601186776', status_: 1 },
            { strCase_: '杀人案', strPhone_: '13911525503', status_: 2 },
            { strCase_: '诈骗案', strPhone_: '18677633201', status_: 1 },
            { strCase_: '诈骗案', strPhone_: '17908829345', status_: 1 }
        ];
        ipcRenderer.send('receive-parsing-detail', JSON.stringify(data));
        log(phoneParam, data);
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
    if (phoneParam === null) {
        phoneParam = args;
        polling(loopHandle, DURATION);
    } else {
        phoneParam = args;
    }
});