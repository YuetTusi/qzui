import EventEmitter from 'events';
import { ipcRenderer } from 'electron';
import { Client } from '@src/@hprose/rpc-core/src';
import '@src/@hprose/rpc-node/src';
import { Provider } from '@src/@hprose/rpc-plugin-reverse/src';
import { helper } from '@src/utils/helper';
import config from '@src/config/ui.config.json';

/**
 * @description RPC远程调用类
 */
class Rpc extends EventEmitter {
    public static uri: string = '';
    public static _client: Client | null = null;
    public static _service: Promise<any> | null = null;
    private _provider: Provider | null = null;

    constructor(uri?: string) {
        super();
        Rpc.uri = helper.isNullOrUndefined(uri) ? config.rpcUri : uri as string;
        if (Rpc._client === null) {
            Rpc._client = new Client(Rpc.uri);
        }
        if (Rpc._service === null) {
            Rpc._service = Rpc._client.useServiceAsync();
        }

        (Rpc._client.socket as any).on('socket-error', (error: Error) => {
            ipcRenderer.send('socket-disconnected', error.message);
        });
    }
    /**
     * @description 调用远程方法
     * @param methodName 远程方法名
     * @param params 方法参数(数组类型)
     * @returns 方法结果的Promise对象
     */
    invoke<T>(methodName: string, params: Array<any> = []): Promise<T> {
        methodName = methodName.toLowerCase(); //远程方法一律以小写名称调用

        return new Promise((resolve, reject) => {
            if (Rpc._service === null) {
                reject(new TypeError('Service对象为空'));
            } else {
                Rpc._service.then((proxy: any) => {
                    return proxy[methodName](...params);
                }).then((result: T) => {
                    resolve(result);
                }).catch((err: Error) => {
                    reject(err);
                });
            }
        });
    }
    /**
     * 向服务器发布反向调用方法
     * @param funcs 函数数组（方法定义）
     * @param channel 频道名（与服务端调用对应）
     */
    provide(funcs: Array<Function>, channel: string) {
        this._provider = new Provider(Rpc._client!, channel);
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

let rpc: any = null;

if (rpc === null) {
    rpc = new Rpc();
}

export { rpc };
export default Rpc;