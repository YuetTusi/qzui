const { ipcRenderer } = require('electron');
const Rpc = require('../../service/rpc.js');
const polling = require('../scripts/polling');

let rpc = new Rpc();

polling(async () => {

    try {
        let phoneData = await rpc.invoke('GetDevlist', []);
        ipcRenderer.send('receive-listening-usb', phoneData);
        return true;
    } catch (error) {
        console.log('@ListeningUsb.js GetDevlist方法调用失败', error);
        return false;
    }
}, 2000);
