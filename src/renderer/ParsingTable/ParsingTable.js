const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');
// const Rpc = require('../scripts/rpc');
// const config = require('../../config/ui.config.json');


const DURATION = 1064;
// const rpc = new Rpc(config.parsingUri);

var phoneParam = null;

/**
 * 轮询
 */
async function loopHandle() {
    if (phoneParam) {
        let data = [];
        try {
            // data = await rpc.invoke('GetAllInfo', []);
            //?测试数据
            data = [
                { strCase_: '诈骗案', strPhone_: '13911520108', status_: 1, DeviceHolder_: '张三', DeviceNumber_: '1001', PhonePath_: 'C:\\Test\\13911520108' },
                { strCase_: '诈骗案', strPhone_: '15601186776', status_: 1, DeviceHolder_: '张三', DeviceNumber_: '1002', PhonePath_: 'C:\\Case1\\15601186776' },
                { strCase_: '杀人案', strPhone_: '13911525503', status_: 2, DeviceHolder_: '张三', DeviceNumber_: '1003', PhonePath_: 'C:\\Case2\\13911525503' },
                { strCase_: '诈骗案', strPhone_: '18677633201', status_: 1, DeviceHolder_: '张三', DeviceNumber_: '1004', PhonePath_: 'C:\\Case3\\18677633201' },
                { strCase_: '诈骗案', strPhone_: '17908829345', status_: 1, DeviceHolder_: '张三', DeviceNumber_: '1005', PhonePath_: 'C:\\测试案\\17908829345' },
                { strCase_: '测试案', status_: 0 },
                { strCase_: '刘强东嫖资不付案', status_: 0, strPhone_: '13801157792' }
            ];
            ipcRenderer.send('receive-parsing-table', JSON.stringify(data));
            log(phoneParam, data);
            return true;
        } catch (error) {
            ipcRenderer.send('receive-parsing-table', []);
            log(phoneParam, error.message);
            return false;
        }
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