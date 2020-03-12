import net from 'net';
import EventEmitter from 'events';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Client } from '@src/@hprose/rpc-core/src';
import '@src/@hprose/rpc-node/src';
import { Provider } from '@src/@hprose/rpc-plugin-reverse/src';
import config from '@src/config/ui.config.json';

let _fetchClient: any = null;//采集正向client
let _fetchService: any = null;//采集正向service
let _fetchReverseClient: any = null;//采集反向client
let _fetchProvider: any = null;//采集反向调用provider
//==================================================
let _parsingClient: any = null;//解析正向client
let _parsingService: any = null;//解析正向service
let _parsingReverseClient: any = null;//解析反向client
let _parsingProvider: any = null;//解析反向provider

if (_fetchClient === null) {
    _fetchClient = new Client(config.rpcUri);
}
if (_fetchService === null) {
    _fetchService = _fetchClient.useServiceAsync();
}
if (_fetchReverseClient === null) {
    _fetchReverseClient = new Client(config.rpcUri);
}
if (_fetchProvider === null) {
    _fetchProvider = new Provider(_fetchReverseClient!, 'default');
}
(_fetchClient.socket as any).on('socket-connect', () => {
    console.log('连上了采集RPC');
});
(_fetchClient.socket as any).on('socket-error', (error: Error) => {
    // console.log(`正向请求断了...`);
    ipcRenderer.send('fetch-socket-disconnected', error.message, config.rpcUri);
});
(_fetchReverseClient.socket as any).on('socket-error', (error: Error) => {
    // console.log(`反向请求断了...`);
    ipcRenderer.send('fetch-reverse-socket-disconnected', error.message, config.rpcUri);
});

//# 断线重连,当收到socket-disconnected后,使用uri重新实例化新的RPC实例
ipcRenderer.on('fetch-socket-disconnected', (event: IpcRendererEvent, uri: string) => {
    (_fetchClient.socket as net.Socket).removeAllListeners('socket-error');
    _fetchClient = new Client(config.rpcUri);
    _fetchService = _fetchClient.useServiceAsync();
    (_fetchClient.socket as any).on('socket-error', (error: Error) => {
        ipcRenderer.send('fetch-socket-disconnected', error.message, config.rpcUri);
    });
});
ipcRenderer.on('fetch-reverse-socket-disconnected', (event: IpcRendererEvent, uri: string) => {
    (_fetchReverseClient.socket as net.Socket).removeAllListeners('socket-error');
    _fetchReverseClient = new Client(config.rpcUri);
    _fetchProvider = new Provider(_fetchReverseClient!, 'default');
    (_fetchReverseClient.socket as any).on('socket-error', (error: Error) => {
        ipcRenderer.send('fetch-reverse-socket-disconnected', error.message, config.rpcUri);
    });
});


if (_parsingClient === null) {
    _parsingClient = new Client(config.parsingUri);
}
if (_parsingService === null) {
    _parsingService = _parsingClient.useServiceAsync();
}
if (_parsingReverseClient === null) {
    _parsingReverseClient = new Client(config.parsingUri);
}
if (_parsingProvider === null) {
    _parsingProvider = new Provider(_parsingReverseClient!, 'default');
}
(_parsingClient.socket as any).on('socket-error', (error: Error) => {
    // console.log(`正向请求断了...`);
    ipcRenderer.send('parsing-socket-disconnected', error.message, config.parsingUri);
});
(_parsingClient.socket as any).on('socket-error', (error: Error) => {
    // console.log(`反向请求断了...`);
    ipcRenderer.send('parsing-reverse-socket-disconnected', error.message, config.parsingUri);
});

//# 断线重连,当收到socket-disconnected后,使用uri重新实例化新的RPC实例
ipcRenderer.on('parsing-socket-disconnected', (event: IpcRendererEvent, uri: string) => {
    (_parsingClient.socket as net.Socket).removeAllListeners('socket-error');
    _parsingClient = new Client(config.parsingUri);
    _parsingService = _parsingClient.useServiceAsync();
    (_parsingClient.socket as any).on('socket-error', (error: Error) => {
        ipcRenderer.send('parsing-socket-disconnected', error.message, config.parsingUri);
    });
});
ipcRenderer.on('parsing-reverse-socket-disconnected', (event: IpcRendererEvent, uri: string) => {
    (_parsingReverseClient.socket as net.Socket).removeAllListeners('socket-error');
    _parsingReverseClient = new Client(config.parsingUri);
    _parsingProvider = new Provider(_parsingReverseClient!, 'default');
    (_parsingReverseClient.socket as any).on('socket-error', (error: Error) => {
        ipcRenderer.send('parsing-reverse-socket-disconnected', error.message, config.parsingUri);
    });
});

/**
 * 采集RPC
 */
class Fetch extends EventEmitter {
    public static uri: string = config.rpcUri;

    private constructor(uri: string) {
        super();
    }
    /**
     * @description 调用远程方法
     * @param methodName 远程方法名
     * @param params 方法参数(数组类型)
     * @returns 方法结果的Promise对象
     */
    static invoke<T>(methodName: string, params: any[] = []): Promise<T> {
        methodName = methodName.toLowerCase(); //远程方法一律以小写名称调用

        return new Promise((resolve, reject) => {
            if (_fetchService === null) {
                reject(new TypeError('Service对象为空'));
            } else {
                _fetchService.then((proxy: any) => {
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
    static provide(funcs: Array<Function>) {
        funcs.forEach(fn => _fetchProvider!.addFunction(fn));
        _fetchProvider.listen();
    }
    /**
     * 关闭反向调用监听
     */
    async closeProvider() {
        if (_fetchProvider !== null) {
            await _fetchProvider.close();
            _fetchProvider = null;
        }
    }
}

/**
 * 解析RPC
 */
class Parsing extends EventEmitter {
    public static uri: string = config.parsingUri;

    private constructor(uri: string) {
        super();
    }
    /**
     * @description 调用远程方法
     * @param methodName 远程方法名
     * @param params 方法参数(数组类型)
     * @returns 方法结果的Promise对象
     */
    static invoke<T>(methodName: string, params: any[] = []): Promise<T> {
        methodName = methodName.toLowerCase(); //远程方法一律以小写名称调用

        return new Promise((resolve, reject) => {
            if (_parsingService === null) {
                reject(new TypeError('Service对象为空'));
            } else {
                _parsingService.then((proxy: any) => {
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
    static provide(funcs: Array<Function>) {
        funcs.forEach(fn => _parsingProvider!.addFunction(fn));
        _parsingProvider.listen();
    }
    /**
     * 关闭反向调用监听
     */
    async closeProvider() {
        if (_parsingProvider !== null) {
            await _parsingProvider.close();
            _parsingProvider = null;
        }
    }
}

export { Fetch, Parsing };