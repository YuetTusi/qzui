const { ipcRenderer } = require('electron');
const config = require('../../config/ui.config.json');
const polling = require('../scripts/polling');
const Rpc = require('../scripts/rpc');

const { ip, replyPort } = config;

let doNext = true;

polling(() => {
    const rpc = new Rpc();
    rpc.invoke('ConnectServer', [ip, replyPort]).then((isConnected) => {
        if (isConnected) {
            console.clear();
            console.log('成功连接RPC服务');
            ipcRenderer.send('receive-connect-rpc', isConnected);
        }
        doNext = !isConnected;
    });
    if (doNext) {
        ipcRenderer.send('receive-connect-rpc', !doNext);
    }
    return doNext;
}, 3640);