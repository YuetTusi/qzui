const { types } = require('util');
const { ipcRenderer } = require('electron');
const Rpc = require('../../service/rpc.js');

let rpc = new Rpc();

polling(async () => {

    try {
        let phoneData = await rpc.invoke('GetDevlist', []);
        // console.log(phoneData);
        ipcRenderer.send('receive-listening-usb', phoneData);
        return true;
    } catch (error) {
        console.log('@ListeningUsb.js GetDevlist方法调用失败', error);
        return false;
    }
}, 2000);

function polling(loopHandle, ms = 2000) {

    (function _loop() {
        setTimeout(() => {
            let ret = loopHandle();
            if (types.isPromise(ret)) {
                (ret).then((isDoNext) => {
                    if (isDoNext) {
                        _loop();
                    }
                }).catch((err) => console.log('ListeningUsb.js/polling 轮询失败', err));
            } else {
                if (ret) _loop();
            }
        }, ms);
    })();
}