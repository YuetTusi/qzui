import { SubscriptionAPI } from 'dva';
import server, { send } from '@src/service/tcpServer';
import { helper } from '@src/utils/helper';
import { Device } from '@src/schema/socket/Device';

// const DEVICE_COUNT: number = helper.readConf().max;

/**
 * 订阅
 */
export default {
    /**
     * 接收设备连接信息
     */
    receiveDevice({ dispatch }: SubscriptionAPI) {
        server.on('device', (data: Device) => {

            console.log(data);

            // let mock:Device=new

            // switch (data.cmd) {
            //     case 'device_in':

            //         break;
            // }
        });
    }
}