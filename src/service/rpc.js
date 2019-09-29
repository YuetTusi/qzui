const { Client } = require('@hprose/rpc-core');
require('@hprose/rpc-node');
const config = require('../config/ui.config.json');

function Rpc(uri) {
    if (uri) {
        this.uri = uri;
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
