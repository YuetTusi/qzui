const EventEmitter = require('events');
const util = require('util');
const { Client } = require('hprose');
const config = require('../config/config.json');

/**
 * 封装RPC客户端请求
 * @param {object} options 配置，若不传入默认会取config配置文件中的地址 
 */
function Rpc(options = {}) {
    if (!(this instanceof Rpc)) {
        throw new Error('不允许以函数方式调用');
    }
    //远程地址
    this.uri = options.uri || config.rpcUri;
    //远程方法集合
    this.methods = options.methods || [];
    //客户端对象
    this._client = null;
    if (!this.uri) {
        throw new Error('uri不可为空');
    } else {
        this._client = Client.create(this.uri, this.methods);
        this._client.on('error', (metodName, err) => {
            this.emit('error', metodName, err);
        });
    }
}

util.inherits(Rpc, EventEmitter);

/**
 * @description 发送RPC请求远程方法
 * @param name 远程方法名
 * @param conditions 参数
 * @returns 调用方法结果的Promise
 */
Rpc.prototype.send = function (name, ...conditions) {
    //使用举例：client.send('getUser','参数1','参数2',...);
    return new Promise((resolve, reject) => {
        this._client[name](...conditions, (data) => {
            if (data instanceof Error) {
                reject(data);
            } else {
                resolve(data);
            }
        });
    });
};

/**
 * @description 发送RPC请求远程方法(可不提前注册远程方法)
 * @param name 远程方法名
 * @param conditions 参数
 * @returns 调用方法结果的Promise
 */
Rpc.prototype.invoke = function (name, ...conditions) {
    //yield call([client, 'invoke'], 'getUser', '111', '222', '333');
    return this._client.invoke(name, conditions);
};

window.Rpc = Rpc;