import net, { Socket } from 'net';
import { stick as StickPackage } from 'stickpackage';
import logger from '@utils/log';
import { helper } from '@src/utils/helper';

/**
 * Socket对象标识
 */
interface SocketMark {
    /**
     * Socket端口
     */
    port: number;
    /**
     * 类型标识
     */
    type: string;
    /**
     * Socket实例
     */
    socket: Socket;
}

let stack = new StickPackage(1024).setReadIntBE(32);
const pool = new Map<string, SocketMark>();
const server = net.createServer();

server.on('connection', (socket: Socket) => {

    console.log(`Socket接入, 端口号: ${socket.remotePort}`);
    logger.info(`Socket接入, 端口号: ${socket.remotePort}`);

    socket.on('data', (chunk: Buffer) => {
        stack.__socket__ = socket;
        stack.putData(chunk);
    });

    socket.on('error', (err) => {
        const type = getSocketTypeByPort(pool, socket.remotePort!);
        removeSocketByPort(pool, socket.remotePort!);
        logger.error(`Socket断开, 端口号: ${socket.remotePort}, 错误消息: ${err.message}`);
        server.emit('socket_error', socket.remotePort, type);
    });
});

server.on('close', () => {
    logger.info('TCP服务已关闭');
});

server.on('error', (err) => {
    logger.info(`TCP服务出错,错误消息: ${err.message}`);
});

stack.onData(stackDataHandle);

/**
 * 粘包回调Handle
 * @param chunk Buffer数据
 */
function stackDataHandle(chunk: Buffer) {
    // 拷贝4个字节的长度
    const head = Buffer.alloc(4);
    chunk.copy(head, 0, 0, 4);
    // 解析数据包内容
    const body = Buffer.alloc(head.readInt32BE());
    // 这里要加上4个字节, 因为是从偏移4的位置开始拷贝
    chunk.copy(body, 0, 4, head.readInt32BE() + 4);
    let data: any = Object.create(null);
    try {
        data = JSON.parse(body.toString());
        let socket = stack.__socket__;

        if (helper.isNullOrUndefined(data.type)) {
            //? 非首次发消息
            let type = getSocketTypeByPort(pool, socket.remotePort!); //从map中找到socket的type
            if (type === null) {
                console.log(`未找到端口号为${socket.remotePort}的socket`);
                logger.error(`未找到端口号为${socket.remotePort}的socket`);
            } else {
                server.emit(type, data);
            }
        } else {
            //? 首次发消息，是新socket
            if (!pool.has(data.type)) {
                //若map中没有名为type的socket，存入map
                pool.set(data.type, {
                    type: data.type,
                    port: socket.remotePort!,
                    socket
                });
            }
            server.emit(data.type, data);
        }
    } catch (error) {
        console.log(`解析JSON数据出错，错误消息：${error.message}`);
        logger.error(`解析JSON数据出错，错误消息：${error.message}`);
        //#当解析JSON出错，重新生成StickPackage实例绑定回调，否则再次发送的数据无法触发回调
        stack = new StickPackage(1024).setReadIntBE(32);
        stack.onData(stackDataHandle);
    }
}

/**
 * 发送消息
 * @param type socket类型
 * @param data 消息数据(JSON类型)
 */
function send(type: string, data: Record<string, any>) {
    const body = Buffer.from(JSON.stringify(data));
    // 写入包头, 也就是4字节大小, 该大小指向后面的json数据的长度, 也就是这里的body
    const head = Buffer.alloc(4);
    head.writeUInt32BE(body.byteLength, 0);
    let current = pool.get(type);
    if (current) {
        current.socket.write(head);
        current.socket.write(body);
    } else {
        console.warn(`${type} socket为空`);
    }
}

/**
 * 从Map中删除端口号为port的Socket
 * @param map Socket键值表
 * @param port 端口
 */
function removeSocketByPort(map: Map<string, SocketMark>, port: number) {
    map.forEach((item) => {
        if (item.port === port) {
            map.delete(item.type);
        }
    })
}

/**
 * 根据Socket端口号找到对应的type
 * @param map Socket键值表
 * @param port 端口
 */
function getSocketTypeByPort(map: Map<string, SocketMark>, port: number) {
    let result: string | null = null;
    for (let [type, socket] of map.entries()) {
        if (socket.port === port) {
            result = type;
            break;
        }
    }
    return result;
}

export { pool, send };
export default server;