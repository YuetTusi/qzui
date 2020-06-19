import net, { Socket } from 'net';

let clientSocket: Socket | null = null;


function getSocket() {
    if (clientSocket === null) {
        clientSocket = new net.Socket({ allowHalfOpen: true });
        clientSocket!.connect({ port: 7777, host: '127.0.0.1' });
        clientSocket.on('connect', () => {
            console.log('TCP已连接');
        });
        clientSocket.on('error', (error) => {
            console.log('TCP报错', error.message);
            clientSocket!.destroy();
            setTimeout(() => {
                clientSocket!.connect({ port: 7777, host: '127.0.0.1' });
            }, 3000);
        })
    }
    return clientSocket;
}

export { getSocket };