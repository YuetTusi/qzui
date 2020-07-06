import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import subscriptions from './subscriptions';
import { helper } from '@src/utils/helper';
import { DeviceType } from '@src/schema/socket/DeviceType';

//采集路数
const deviceCount: number = helper.readConf().max;

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
        deviceList: new Array<DeviceType>(deviceCount)
    },
    reducers,
    effects,
    subscriptions
};

export { StoreState };
export default model;