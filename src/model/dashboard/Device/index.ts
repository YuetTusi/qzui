import { Model } from 'dva';
import { helper } from '@utils/helper';
import { DeviceType } from '@src/schema/socket/DeviceType';
import reducers from './reducers';
import effects from './effects';
import subscriptions from './subscriptions';

//采集路数
const { max } = helper.readConf();

/**
 * 仓库
 */
interface StoreState {
    /**
     * 案件数据是否为空
     */
    isEmptyCase: boolean,
    /**
     * 设备列表
     */
    deviceList: DeviceType[]
}

let model: Model = {
    namespace: 'device',
    state: {
        isEmptyCase: false,
        deviceList: new Array<DeviceType>(max)
    },
    reducers,
    effects,
    subscriptions
};

export { StoreState };
export default model;