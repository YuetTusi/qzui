declare module "stickpackage" {

    import { Socket } from 'net';

    class stick {
        constructor(arg0: number);
        /**
         * 设置大端接收
         * type:16  包头长度为2，short类型
         * type:32  包头长度为4，int类型
         */
        setReadIntBE: (type: number) => this;
        /**
         * 设置小端接收
         * type:16  包头长度为2，short类型
         * type:32  包头长度为4，int类型
         */
        setReadIntLE: (type: number) => this;
        /**
         * 数据包接收完整后触发事件
         */
        onData: (callback: Function) => void;
        /**
         * 数据包错误触发事件
         */
        onError: (callback: Function) => void;
        /**
         * 往buffer填入数据
         */
        putData: (data?: Buffer) => void;
        /**
         * 向Buffer填入消息
         */
        putMsg: (msg: string) => void;
        /**
         * 往buffer填入消息
         */
        publish: (msg: string) => Buffer;
        /**
         * 获取数据
         */
        getData: () => void;
        /**
         * 获取buffer可用的空间长度
         */
        getDataLen: () => number;
        /**
         * 寄存原生socket对象
         */
        __socket__: Socket;
    }
    class msgCenter {
        /**
         * 向stick 队列中推送消息
         */
        putMsg: (msg: string) => void;
        /**
         * 向stick 队列中推送字节流
         */
        putData: (data: Buffer) => void;

        publish: (msg: string) => Buffer;

        onMsgRecv: (handle: (arg0: Buffer) => void) => void;
    }
}


