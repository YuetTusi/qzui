const EventEmitter = require('events');
const util = require('util');
const { Client, BytesIO, Writer } = require('hprose');
const config = require('../config/ui.config');

/**
 * @deprecated 此代码为hprose_2.0版，已废弃
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
        throw new TypeError('uri不可为空');
    } else {
        this._client = Client.create(this.uri, this.methods);
        this._client.on('error', (metodName, err) => {
            this.emit('error', metodName, err);
        });
        this._client.on('failswitch', (client) => {
            this.emit('failswitch', client);
        });
    }
}

util.inherits(Rpc, EventEmitter);

/**
 * @description 发送RPC请求远程方法
 * @param {string} name 远程方法名
 * @param {*} conditions 参数
 * @returns 调用方法结果的Promise
 */
Rpc.prototype.send = function (name, ...conditions) {
    //使用举例：client.send('getUser','参数1','参数2',...);
    return new Promise((resolve, reject) => {
        // try {
        //     //若序列化数据，请取消以下注释
        //     conditions = conditions.map((p) => {
        //         return this.serialize(p);
        //     });
        // } catch (error) {
        //     console.error('序列化数据失败 @src/service/rpc.js');
        //     reject(error);
        // }
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
 * @param {string} name 远程方法名
 * @param {*} conditions 参数
 * @returns 调用方法结果的Promise
 */
Rpc.prototype.invoke = function (name, ...conditions) {
    //yield call([client, 'invoke'], 'getUser', '111', '222', '333');
    // try {
    //     conditions = conditions.map((p) => {
    //         return this.serialize(p);
    //     });
    // } catch (error) {
    //     console.error('序列化数据失败 @src/service/rpc.js');
    //     return Promise.reject(error);
    // }

    return this._client.invoke(name, conditions);
};

/**
 * @description 订阅推送
 * @param {string} topic 主题
 * @param {function} callback 回调(参数即为服务器推送的数据)
 * @returns {function} 退订
 */
Rpc.prototype.subscribe = function (topic, callback) {
    this._client.subscribe(topic, callback);
    return () => this._client.unsubscribe(topic, callback);
};


/**
 * @description 序列化数据
 * @param {*} data 源数据
 * @returns 经过序列化后的Uint8Array数据
 */
Rpc.prototype.serialize = function (data) {
    let chunk = new BytesIO();
    let writer = new Writer(chunk);
    writer.serialize(data);
    return chunk;
}

window.Rpc = Rpc;