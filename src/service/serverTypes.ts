import { Socket } from 'net';

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

export { SocketMark };