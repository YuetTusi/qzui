import { Model } from 'dva';
import reducers from './reducers';
import subscriptions from './subscriptions';
import { helper } from '@src/utils/helper';
import { DeviceType } from '@src/schema/socket/DeviceType';

const DEVICE_COUNT: number = helper.readConf().max;

/**
 * 仓库
 */
interface StoreState {
    /**
     * 设备列表
     */
    deviceList: DeviceType[];
}

let model: Model = {
    namespace: 'device',
    state: {
        deviceList: new Array<DeviceType>(DEVICE_COUNT)
    },
    reducers,
    subscriptions
};

export { StoreState };
export default model;