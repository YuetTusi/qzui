const { Service } = require('@hprose/rpc-core');
const net = require('net');
const config = require('../../config/ui.config.json');

/**
 * 本地RPC服务
 * 监听远程反馈数据
 */
class Reply {
    constructor(funcs, port) {

        this._port = port ? port : config.replyPort;

        const service = new Service();
        //注册方法
        this._funcs = funcs;
        if (this._funcs && this._funcs.length > 0) {
            this._funcs.forEach((fn) => {
                if (typeof fn === 'function') {
                    service.addFunction(fn);
                } else {
                    throw new TypeError('注册的方法不是Function');
                }
            });
        }

        const server = net.createServer();
        this._server = server;
        service.bind(server);
        server.listen(this._port);
    }
    //是否已实例化Server
    hasServerInstance() {
        if (this._server) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 关闭服务器
     */
    close() {
        if (this._server) {
            this._server.close();
        }
    }
}

module.exports = Reply;