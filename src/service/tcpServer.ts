
import { EventEmitter } from 'events';
import net, { Socket } from 'net';
import { stick } from 'stickpackage';

interface SocketPool {
    port: number;
    socket: Socket;
}

const stack: any = new stick(1024).setReadIntBE('32');
const pool = new Map<string, SocketPool>();

let temp: any[] = [];

let server = net.createServer(() => {
    console.log('已连接');
});

server.on('connection', (socket) => {


    console.log('有socket接入');
    
    temp.push(socket);
    // console.log(socket.remoteAddress);
    // console.log(socket.remotePort);

    socket.on('data', (chunk) => {
        stack.putData(chunk);
    })

    socket.on('error', (err) => {
        console.log(socket.remotePort);
        console.log(err.message);
        // sockets.delete(socket.remotePort!);
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

        pool.set(json.type, { port: socket.remotePort!, socket });
        // if (!pool.has(json.type)) {
        //     pool.set(json.type, { port: socket.remotePort!, socket });
        // }
        // console.log(temp);
    });

    // sockets.set(socket.remotePort!, socket);
});

server.on('close', () => {
    console.log('服务已关闭');
});

server.on('error', (err) => {
    console.log(err.message);
});

export { pool };
export default server;