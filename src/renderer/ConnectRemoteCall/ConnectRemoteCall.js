const net = require('net');
const url = require('url');
const { ipcRenderer } = require('electron');
const config = require('../../config/ui.config.json');
const polling = require('../scripts/polling');

const { rpcUri } = config;
const { port, hostname } = url.parse(rpcUri);
const socket = new net.Socket();

polling(() => startConnect(), 3640);

/**
 * 开启一个TCP连接
 */
function startConnect() {
    socket.removeAllListeners('connect');
    socket.removeAllListeners('error');
    return new Promise((resolve) => {
        socket.connect(port, hostname, () => {
            //当正确连上了TCP服务，则向主进程发送消息
            ipcRenderer.send('receive-connect-rpc', true);
            socket.destroy();
            resolve(false);
        });
        socket.on('error', (err) => {
            //未连上，则返回Promise<true>进行下一次轮询
            console.log(err.message);
            resolve(true);
        });
    });
}