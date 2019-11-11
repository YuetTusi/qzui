const { types } = require('util');

function polling(loopHandle, ms = 2000) {

    (function _loop() {
        setTimeout(() => {
            let ret = loopHandle();
            if (types.isPromise(ret)) {
                (ret).then((isDoNext) => {
                    if (isDoNext) {
                        _loop();
                    }
                }).catch((err) => console.log('@renderer/ListeningUsb.js/polling 轮询失败', err));
            } else {
                if (ret) _loop();
            }
        }, ms);
    })();
}

module.exports = polling;