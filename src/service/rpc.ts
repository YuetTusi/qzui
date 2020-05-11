import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import { Client } from '@src/@hprose/rpc-core/src';
import '@src/@hprose/rpc-node/src';
import { Provider } from '@src/@hprose/rpc-plugin-reverse/src';
import { helper } from '@utils/helper';
import logger from '@src/utils/log';

const config = helper.getConfig();

/**
 * @description RPC远程调用类
 */
class Rpc extends EventEmitter {
    public readonly uri: string = '';
    private _client: Client | null = null;
    private _service: Promise<any> | null = null;
    private _reverseClient: Client | null = null; //反向连接的client
    private _provider: Provider | null = null;

    constructor(uri: string) {
        super();
        this.uri = uri;
        this.build();
    }
    /**
     * 创建连接对象
     */
    private build(): void {
        if (this._client !== null) {
            (this._client.socket as any).removeAllListeners('socket-connect');
            (this._client.socket as any).removeAllListeners('socket-error');
        }
        if (this._reverseClient !== null) {
            (this._reverseClient.socket as any).removeAllListeners('socket-connect');
            (this._reverseClient.socket as any).removeAllListeners('socket-error');
        }
        this._client = new Client(this.uri);
        this._service = this._client.useServiceAsync();
        this._reverseClient = new Client(this.uri);
        (this._client.socket as any).on('socket-connect', () => {
            logger.info(`${this.uri} client已接入`);
            ipcRenderer.send('socket-connect', this.uri);
        });
        (this._client.socket as any).on('socket-error', (error: Error) => {
            logger.error(`${this.uri} client断线`);
            this.emit('socket-error', error);
            setTimeout(() => this.build(), 812);
        });
        logger.info(`new reverse实例 ${this.uri}`);
        (this._reverseClient.socket as any).on('socket-connect', () => {
            //*连接服务端成功后，向主进程发送消息
            logger.info(`${this.uri} reverse已接入`);
            ipcRenderer.send('socket-connect', this.uri);
        });
        logger.info('监听socket-connect');
        (this._reverseClient.socket as any).on('socket-error', (error: Error) => {
            //!连接中断后，发射消息并重新build()
            logger.error(`${this.uri} reverse断线`);
            this.emit('reverse-error', error);
            setTimeout(() => this.build(), 812);
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
    provide(funcs: Array<Function>, channel: string): void {
        this._provider = new Provider(this._reverseClient!, channel);
        funcs.forEach(fn => this._provider!.addFunction(fn));
        this._provider.listen();
    }
    /**
     * 关闭反向调用监听
     */
    closeProvider(): Promise<void> {
        if (this._provider !== null) {
            return this._provider.close();
        } else {
            return Promise.reject(new Error('provider is null'));
        }
    }
}

/**
 * 采集RPC对象
 */
const fetcher = new Rpc(config.rpcUri);
/**
 * 解析RPC对象
 */
const parser = new Rpc(config.parsingUri);

//NOTE: 采集和解析RPC对象整个应用全局唯一，且不可更改（对象为const常量）
//NOTE: 在发布反向接口时，只在启动应用时监听一次

export { fetcher, parser };
export default Rpc;