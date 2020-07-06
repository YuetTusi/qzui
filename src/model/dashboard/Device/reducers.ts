import { AnyAction } from 'redux';
// import { helper } from '@src/utils/helper';
// import { Device } from '@src/schema/socket/Device';

// const DEVICE_COUNT: number = helper.readConf().max;

/**
 * Reducers
 */
export default {
    /**
     * 更新设备到列表中
     * @param payload 设备(DeviceType)对象
     */
    setDevice(state: any, { payload }: AnyAction) {

        let newList = [...state.deviceList];
        newList[Number(payload.usb) - 1] = { ...payload };

        return {
            ...state,
            deviceList: newList
        };
    }
}