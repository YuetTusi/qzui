const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');

const DURATION = 500;
var phoneParam = null; //将参数保存为全局，以避免闭包记忆的影响

/**
 * 轮询
 */
async function loopHandle() {

    if (phoneParam) {
        let result = [{
            m_strCaseName: '测试',
            m_bIsAutoParse: true,
            m_bIsGenerateBCP: false,
            m_Applist: []
        }, {
            m_strCaseName: '非自动解析案件',
            m_bIsAutoParse: false,
            m_bIsGenerateBCP: false,
            m_Applist: []
        }, {
            m_strCaseName: '自动解析案件',
            m_bIsAutoParse: true,
            m_bIsGenerateBCP: false,
            m_Applist: ['wechat', 'weibo']
        }];
        result = result.map(item => ({
            ...item,
            phoneList: [
                { col0: 'iPhone7 Plus', col1: '刘某某', col2: '刘警员', col3: ~~(Math.random() * 3) },
                { col0: 'HUAWEI P30', col1: '刘某某', col2: '刘警员', col3: ~~(Math.random() * 3) },
                { col0: 'SAMSUNG A90', col1: '张某某', col2: '刘警员', col3: ~~(Math.random() * 3) }
            ]
        }));
        ipcRenderer.send('receive-parsing-detail', JSON.stringify(result));
        log(phoneParam, result);
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