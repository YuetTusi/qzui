import EventEmitter from 'events';
import { ipcRenderer } from 'electron';
import { Client } from '@src/@hprose/rpc-core/src';
import '@src/@hprose/rpc-node/src';
import { Provider } from '@src/@hprose/rpc-plugin-reverse/src';
import config from '@src/config/ui.config.json';

/**
 * @description RPC远程调用类
 */
class Rpc extends EventEmitter {
    public uri: string = '';
    public _client: Client | null = null;
    public _service: Promise<any> | null = null;
    public _reverseClient: Client | null = null;
    private _provider: Provider | null = null;

    constructor(uri: string) {
        super();
        this.uri = uri!;
        this._client = new Client(this.uri);
        this._service = this._client.useServiceAsync();
        this._reverseClient = new Client(this.uri);

        (this._client.socket as any).on('socket-connect', (error: Error) => {
            console.log(`${this.uri} 已连上RPC...`);
            // ipcRenderer.send('socket-connect', error.message);
        });
        (this._client.socket as any).on('socket-error', (error: Error) => {
            console.log(`${this.uri} 已断开...`);
            // ipcRenderer.send('socket-disconnected', error.message);
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
            if (this._service === null) {
                reject(new TypeError('Service对象为空'));
            } else {
                this._service.then((proxy: any) => {
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
        this._provider = new Provider(this._reverseClient!, channel);
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

//定义为常量，全局唯一且不可更改
const fetcher = new Rpc(config.rpcUri);
const parser = new Rpc(config.parsingUri);

export { fetcher, parser };
export default Rpc;