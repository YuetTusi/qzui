import { SubscriptionAPI } from 'dva';
import server, { send } from '@src/service/tcpServer';
// import { helper } from '@src/utils/helper';
import { DeviceType } from '@src/schema/socket/DeviceType';
// import SystemType from '@src/schema/SystemType';
import { FetchState } from '@src/schema/socket/DeviceState';

// const DEVICE_COUNT: number = helper.readConf().max;

/**
 * 订阅
 */
export default {
    /**
     * 接收设备连接信息
     */
    receiveDevice({ dispatch }: SubscriptionAPI) {

        server.on('device', (data: DeviceType) => {

            console.log(data);

            // let mock: DeviceType = {
            //     brand: 'Samsung',
            //     model: 'S60',
            //     system: 'android',
            //     usb: '2',
            //     fetchState: FetchState.Connected
            // }

            switch (data.cmd) {
                case 'device_in':
                    dispatch({ type: 'setDevice', payload: data });
                    break;
            }
        });
    }
}