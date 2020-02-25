const { Client } = require('../../../@hprose/rpc-core/src');
require('../../../@hprose/rpc-node/src');
const config = require('../../config/ui.config');

/**
 * 远程调用类
 * @param {string} uri 远程服务地址，为空使用配置文件中的默认地址
 */
function Rpc(uri) {
    if (uri) {
        if (typeof uri === 'string') {
            this.uri = uri;
        } else {
            throw new TypeError('Uri类型不合法');
        }
    } else {
        this.uri = config.rpcUri;
    }

    this._client = null;
    try {
        this._client = new Client(this.uri);
    } catch (error) {
        throw error;
    }
}

/**
 * 调用远程方法
 * @param {string} methodName 远程方法名
 * @param {Array} params 参数
 */
Rpc.prototype.invoke = function (methodName, params) {
    const proxyPromise = this._client.useServiceAsync();
    methodName = methodName.toLowerCase(); //远程方法一律以小写名称调用

    return new Promise((resolve, reject) => {
        proxyPromise.then((proxy) => {
            return proxy[methodName](...params);
        }).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports = Rpc;
