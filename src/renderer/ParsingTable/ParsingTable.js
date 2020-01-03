const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');
const Rpc = require('../scripts/rpc');
const config = require('../../config/ui.config.json');


const DURATION = 2048;
const rpc = new Rpc(config.parsingUri);

var phoneParam = null;

/**
 * 轮询
 */
async function loopHandle() {
    if (phoneParam) {
        let data = await rpc.invoke('GetAllInfo', []);
        // let data = [
        //     { strCase_: '诈骗案', strPhone_: '13911520108', status_: 1 },
        //     { strCase_: '诈骗案', strPhone_: '15601186776', status_: 1 },
        //     { strCase_: '杀人案', strPhone_: '13911525503', status_: 2 },
        //     { strCase_: '诈骗案', strPhone_: '18677633201', status_: 1 },
        //     { strCase_: '诈骗案', strPhone_: '17908829345', status_: 1 },
        //     { strCase_: '测试案', status_: 0 },
        //     { strCase_: '刘强东嫖资不付案', status_: 0, strPhone_: '13801157792' }
        // ];
        ipcRenderer.send('receive-parsing-table', JSON.stringify(data));
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
    phoneParam = args;
    polling(loopHandle, DURATION);
});