
import { EventEmitter } from 'events';
import net, { Socket } from 'net';
import { stick } from 'stickpackage';

interface SocketPool {
    port: number;
    type: string;
    socket: Socket;
}

const stack: any = new stick(1024).setReadIntBE('32');
const pool = new Map<string, SocketPool>();

let server = net.createServer(() => {
    console.log('已连接');
});

server.on('connection', (socket) => {

    console.log('有socket接入');

    socket.on('data', (chunk) => {
        stack.__socket__ = socket;
        stack.putData(chunk);
    })

    socket.on('error', (err) => {
        removeSocketByPort(pool, socket.remotePort!);
        console.log(pool.size);
        console.log(err.message);
    });
});

server.on('close', () => {
    console.log('服务已关闭');
});

server.on('error', (err) => {
    console.log(err.message);
});

stack.onData((data: Buffer) => {
    // 拷贝4个字节的长度
    const head = Buffer.alloc(4);
    data.copy(head, 0, 0, 4);
    // 解析数据包内容
    const body = Buffer.alloc(head.readInt32BE());
    // 这里要加上4个字节, 因为是从偏移4的位置开始拷贝
    data.copy(body, 0, 4, head.readInt32BE() + 4);
    let origin = body.toString();
    let json = JSON.parse(origin);
    console.log('收到数据: ', json.type);

    let socket = stack.__socket__;

    pool.set(json.type, { port: socket.remotePort!, socket, type: json.type });
    if (!pool.has(json.type)) {
        pool.set(json.type, {
            type: json.type,
            port: socket.remotePort!,
            socket
        });
        console.log(pool.size);
    }
});

/**
 * 发送消息
 * @param type socket类型
 * @param data 消息数据(JSON类型)
 */
function send(type: string, data: any) {
    // 回复数据
    const body = Buffer.from(JSON.stringify(data));
    // 写入包头, 也就是4字节大小, 该大小指向后面的json数据的长度, 也就是这里的body
    const headBuf = Buffer.alloc(4);
    headBuf.writeUInt32BE(body.byteLength, 0);
    pool.get(type)?.socket.write(headBuf);
    pool.get(type)?.socket.write(body);
}

/**
 * 从pool中删除端口号为port的Socket
 * @param map SocketPool
 * @param port 端口
 */
function removeSocketByPort(map: Map<string, SocketPool>, port: number) {
    map.forEach((item) => {
        if (item.port === port) {
            map.delete(item.type);
        }
    })
}

export { pool, send };
export default server;