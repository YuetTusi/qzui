const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');
const Rpc = require('../scripts/rpc');


const DURATION = 500;
const rpc = new Rpc('tcp4://192.168.1.35:60000/');

/**
 * phoneParam={
 *  caseName:'案件名',
 *  phoneName:'手机名'
 * }
 */
var phoneParam = null;

/**
 * 轮询
 */
async function loopHandle() {
    console.log(phoneParam);

    if (phoneParam) {
        let message = await rpc.invoke('GetOneInfo', [phoneParam.caseName, phoneParam.phoneName]);
        ipcRenderer.send('receive-parsing-detail', message);
        log(phoneParam, message);
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