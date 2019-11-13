const { ipcRenderer } = require('electron');
const polling = require('../scripts/polling');
const Rpc = require('../scripts/rpc');

const DURATION = 2000;
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
}, DURATION);
