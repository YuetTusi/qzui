import { Client, Context } from '@hprose/rpc-core';
import { Prosumer, Message } from '@hprose/rpc-plugin-push';
import '@hprose/rpc-node';
import config from '@src/config/view.config';

/**
 * @description RPC远程调用类
 */
class Rpc {
    public uri: (string | null) = null;
    private _client: any = null;

    constructor(uri?: string) {
        if (uri) {
            this.uri = uri;
        } else {
            this.uri = config.rpcUri;
        }
        try {
            this._client = new Client(this.uri);
        } catch (error) {
            throw error;
        }
    }
    /**
     * @description 调用远程方法
     * @param methodName 远程方法名
     * @param params 方法参数(数组类型)
     * @returns 方法结果的Promise对象
     */
    invoke(methodName: string, params: Array<any> = []): Promise<any> {
        const proxyPromise = this._client.useServiceAsync();
        methodName = methodName.toLowerCase(); //远程方法一律以小写名称调用

        return new Promise((resolve, reject) => {
            proxyPromise.then((proxy: any) => {
                return proxy[methodName](...params);
            }).then((result: string) => {
                resolve(result);
            }).catch((err: Error) => {
                reject(err);
            });
        });
    }
}


export default Rpc;