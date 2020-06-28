import net, { Socket } from 'net';
import { stick } from 'stickpackage';
import logger from '@utils/log';

interface SocketPool {
    port: number;
    type: string;
    socket: Socket;
}

const stack: any = new stick(1024).setReadIntBE('32');
const pool = new Map<string, SocketPool>();
const server = net.createServer();

server.on('connection', (socket: Socket) => {

    logger.info(`Socket接入, 端口号: ${socket.remotePort}`);

    socket.on('data', (chunk: Buffer) => {
        stack.__socket__ = socket;
        stack.putData(chunk);
    })

    socket.on('error', (err) => {
        removeSocketByPort(pool, socket.remotePort!);
        logger.info(`Socket断开, 端口号: ${socket.remotePort}, 错误消息: ${err.message}`);
    });
});

server.on('close', () => {
    console.log('TCP服务已关闭');
});

server.on('error', (err) => {
    logger.info(`TCP服务中断,错误消息: ${err.message}`);
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
    server.emit(json.type, json);

    let socket = stack.__socket__;

    pool.set(json.type, { port: socket.remotePort!, socket, type: json.type });
    if (!pool.has(json.type)) {
        pool.set(json.type, {
            type: json.type,
            port: socket.remotePort!,
            socket
        });
    }
});

/**
 * 发送消息
 * @param type socket类型
 * @param data 消息数据(JSON类型)
 */
function send(type: string, data: Partial<Record<string, any>>) {
    // 回复数据
    const body = Buffer.from(JSON.stringify(data));
    // 写入包头, 也就是4字节大小, 该大小指向后面的json数据的长度, 也就是这里的body
    const head = Buffer.alloc(4);
    head.writeUInt32BE(body.byteLength, 0);
    let current = pool.get(type);
    if (current) {
        current.socket.write(head);
        current.socket.write(body);
    }
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