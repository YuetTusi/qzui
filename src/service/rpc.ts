import { Client, Context } from '@hprose/rpc-core';
import { Prosumer, Message } from '@hprose/rpc-plugin-push';
import '@hprose/rpc-node';
import config from '@src/config/view.config';

/**
 * @description RPC远程调用类
 */
class Rpc {
    uri: (string | null) = null;
    _client: any = null;

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
    invoke(methodName: string, params: Array<any> = []): Promise<string> {
        const proxyPromise = this._client.useServiceAsync();

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
    subscribe(topic: string) {

        let prosumer = new Prosumer(new Client(this.uri as string), 'test');
        prosumer.subscribe(topic, (msg: Message) => {
            console.log(msg.data);
        }).then((response: boolean) => {
            console.log(response);
        }).catch((err: Error) => {
            console.log(err);
        });
    }
}


export default Rpc;