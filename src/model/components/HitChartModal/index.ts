import DeviceType from '@src/schema/socket/DeviceType';
import { Model } from 'dva';
import reducers from './reducers';

interface HitChartModalState {

    /**
     * 显示
     */
    visible: boolean,
    /**
     * 数据
     */
    data: Array<{ name: string, value: number }>,
    /**
     * 设备数据
     */
    device?: DeviceType
}

/**
 * 命中数量饼状图
 */
let model: Model = {
    namespace: 'hitChartModal',
    state: {
        visible: false,
        data: [],
        device: undefined
    },
    reducers
};

export { HitChartModalState };
export default model;