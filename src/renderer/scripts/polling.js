const { types } = require('util');

/**
 * 方法轮询
 * @param {Function} loopHandle 轮询的方法，当回调返回false或Promise<false>终止轮询
 * @param {number} ms 间隔，默认2000毫秒
 */
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