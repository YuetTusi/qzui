import { AnyAction } from 'redux';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';

// const DEVICE_COUNT: number = helper.readConf().max;

/**
 * Reducers
 */
export default {
    /**
     * 覆盖设备列表
     */
    setDeviceList(state: any, { payload }: AnyAction) {
        return { ...state, deviceList: payload };
    },
    /**
     * 更新设备到列表中
     * usb序号从1开始
     * @param payload 设备(DeviceType)对象
     */
    setDeviceToList(state: any, { payload }: AnyAction) {
        let next = [...state.deviceList];
        next[payload.usb - 1] = { ...payload };

        return {
            ...state,
            deviceList: next
        };
    },
    /**
     * 更新列表中某个设备的属性
     * usb序号从1开始
     * @param payload 传usb序号和属性名称、新值 例：{usb:2,name:'brand',value:'huawei'}
     */
    updateProp(state: any, { payload }: AnyAction) {
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
    },
    /**
     * 从列表中删除设备(根据USB序号删除)
     * usb序号从1开始
     * @param payload USB序号
     */
    removeDevice(state: any, { payload }: AnyAction) {

        let next = state.deviceList.map((item: DeviceType) => {
            if (helper.isNullOrUndefined(item)) {
                return undefined;
            } else if (item.usb == payload) {
                return undefined;
            } else {
                return item;
            }
        });

        return { ...state, deviceList: next };
    },
    /**
     * 更新采集进度消息到设备中
     * @param payload.usb USB序号
     * @param payload.fetchRecord 进度消息 FetchRecord对象
     */
    setRecordToDevice(state: any, { payload }: AnyAction) {
        let device = state.deviceList[payload.usb - 1];
        if (helper.isNullOrUndefined(device)) {
            return state;
        } else {
            if (helper.isNullOrUndefined(device.fetchRecord)) {
                device.fetchRecord = [];
            }
            let list = [...device.fetchRecord];
            list.unshift(payload.fetchRecord);
            device = {
                ...device,
                fetchRecord: list
            };
            let next = [...state.deviceList];
            next[payload.usb - 1] = { ...device };
            return {
                ...state,
                deviceList: next
            }
        }
    }
}