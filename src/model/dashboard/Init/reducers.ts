import { AnyAction } from 'redux';
// import { helper } from '@src/utils/helper';
// import { Device } from '@src/schema/socket/Device';

// const DEVICE_COUNT: number = helper.readConf().max;

/**
 * Reducers
 */
export default {
    /**
     * 更新设备列表
     * @param payload 传设备数组
     */
    setDeviceList(state: any, { payload }: AnyAction) {
        return {
            ...state,
            deviceList: payload
        }
    }
}