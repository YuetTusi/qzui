import { SubscriptionAPI } from 'dva';
import server, { send } from '@src/service/tcpServer';
// import { helper } from '@src/utils/helper';
import { DeviceType } from '@src/schema/socket/DeviceType';
// import SystemType from '@src/schema/SystemType';
import { DeviceState } from '@src/schema/socket/DeviceState';

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

            let mock: DeviceType = {
                brand: 'samsung',
                model: 'A90',
                system: 'Android',
                usb: '1',
                state: DeviceState.Connected
            }

            switch (data.cmd) {
                case 'device_in':
                    mock.usb = data.usb;
                    dispatch({ type: 'setDevice', payload: mock });
                    break;
            }
        });
    }
}