import { Model } from 'dva';
import reducers from './reducers';
import subscriptions from './subscriptions';
import { helper } from '@src/utils/helper';
import { Device } from '@src/schema/socket/Device';

/**
 * 仓库
 */
interface StoreState {
    /**
     * 设备列表
     */
    deviceList: Device[];
}

let model: Model = {
    namespace: 'test',
    state: {
        deviceList: []
    },
    reducers,
    subscriptions
};

export { Device, StoreState };
export default model;