import { AnyAction } from 'redux';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';

// const DEVICE_COUNT: number = helper.readConf().max;

/**
 * Reducers
 */
export default {
    /**
     * 更新设备列表
     */
    setDeviceList(state: any, { payload }: AnyAction) {
        return { ...state, deviceList: payload };
    },
    /**
     * 更新设备到列表中
     * @param payload 设备(DeviceType)对象
     */
    setDeviceToList(state: any, { payload }: AnyAction) {

        let newList = [...state.deviceList];
        newList[Number(payload.usb) - 1] = { ...payload };

        return {
            ...state,
            deviceList: newList
        };
    },
    /**
     * 更新列表中某个设备的属性
     * usb序号从1开始
     * @param payload 传usb序号和属性名称、新值 例：{usb:2,name:'brand',value:'huawei'}
     */
    setDeviceByProp(state: any, { payload }: AnyAction) {
        const { usb, name, value } = payload;
        let newList = state.deviceList.map((item: DeviceType) => {
            if (helper.isNullOrUndefined(item)) {
                return undefined;
            } else if (item.usb == usb) {
                return {
                    ...item,
                    [name]: value
                };
            } else {
                return item;
            }
        });
        return { ...state, deviceList: newList };
    }
}