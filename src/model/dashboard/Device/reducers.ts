import { AnyAction } from 'redux';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';

// const DEVICE_COUNT: number = helper.readConf().max;

/**
 * Reducers
 */
export default {
    /**
     * 更新案件数据是否为空
     * @param payload true/false
     */
    setEmptyCase(state: any, { payload }: AnyAction) {
        return {
            ...state,
            isEmptyCase: payload
        }
    },
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
     * @param payload 传usb序号和属性名称、新值 例：{usb:1,name:'manufacturer',value:'samsung'}
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
     * 进度消息追加到设备数据中
     * @param payload.usb USB序号（从1开始）
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
            list.push(payload.fetchRecord);
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