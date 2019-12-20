import { Client } from '@hprose/rpc-core';
import '@hprose/rpc-node';
import { Provider } from '@hprose/rpc-plugin-reverse';
import config from '@src/config/ui.config.json';

/**
 * @description RPC远程调用类
 */
class Rpc {
    public uri: (string | null) = null;
    private _client: Client | null = null;
    private _provider: Provider | null = null;

    constructor(uri?: string) {
        this.uri = uri || config.rpcUri;
        this._client = new Client(this.uri as string);
    }
    /**
     * @description 调用远程方法
     * @param methodName 远程方法名
     * @param params 方法参数(数组类型)
     * @returns 方法结果的Promise对象
     */
    invoke(methodName: string, params: Array<any> = []): Promise<any> {
        const proxyPromise = this._client!.useServiceAsync();
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
    /**
     * 向服务器发布反向调用方法
     * @param funcs 函数数组（方法定义）
     * @param channel 频道名（与服务端调用对应）
     */
    provide(funcs: Array<Function>, channel: string) {
        this._provider = new Provider(this._client!, channel);
        funcs.forEach(fn => this._provider!.addFunction(fn));
        this._provider.listen();
    }
    /**
     * 关闭反向调用监听
     */
    async closeProvider() {
        if (this._provider !== null) {
            await this._provider.close();
        }
    }
}


export default Rpc;