import { Service } from '@hprose/rpc-core';
import net from 'net';
import config from '@src/config/ui.config.json';

/**
 * 本地RPC服务
 * 监听远程反馈数据
 */
class Reply {
    private _port: number;
    private _server: any;
    private _funcs: Array<any>;
    constructor(funcs: Array<any>, port?: number) {

        this._port = port ? port : config.replyPort;

        const service = new Service();
        //注册方法
        this._funcs = funcs;
        if (this._funcs && this._funcs.length > 0) {
            this._funcs.forEach((fn: Function) => {
                if (typeof fn === 'function') {
                    service.addFunction(fn);
                } else {
                    throw new TypeError('注册的方法不是Function');
                }

            });
        }

        const server = net.createServer();
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

export default Reply;