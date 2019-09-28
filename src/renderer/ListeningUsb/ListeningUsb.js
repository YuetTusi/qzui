const { ipcRenderer } = require('electron');
const Rpc = require('../../service/rpc.js');

let rpc = new Rpc('tcp4://127.0.0.1:41622/');

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
});

function polling(loopHandle, ms = 2000) {

    (function _loop() {
        setTimeout(() => {
            let ret = loopHandle();
            if (typeof ret === 'object' && typeof ret.then === 'function') {
                (ret).then((result) => {
                    if (result) {
                        _loop();
                    }
                }).catch((err) => console.log('ListeningUsb.js/polling 轮询失败', err));
            } else {
                if (ret) _loop();
            }
        }, ms);
    })();
}