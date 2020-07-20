import { AnyAction } from 'redux';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import TipType from '@src/schema/socket/TipType';
import GuideImage from '@src/schema/socket/GuideImage';

/**
 * Reducers
 */
export default {
    /**
     * 更新案件数据是否为空
     * @param payload true/false
     */
    setEmptyCase(state: any, { payload }: AnyAction) {
        state.isEmptyCase = payload;
        return state;
    },
    /**
     * 覆盖设备列表
     */
    setDeviceList(state: any, { payload }: AnyAction) {
        state.deviceList = payload;
        return state;
    },
    /**
     * 更新设备到列表中
     * usb序号从1开始
     * @param payload 设备(DeviceType)对象
     */
    setDeviceToList(state: any, { payload }: AnyAction) {
        state.deviceList[payload.usb - 1] = payload;
        return state;
    },
    /**
     * 更新列表中某个设备的属性
     * usb序号从1开始
     * @param payload 传usb序号和属性名称、新值 例：{usb:1,name:'manufacturer',value:'samsung'}
     */
    updateProp(state: any, { payload }: AnyAction) {
        const { usb, name, value } = payload;
        state.deviceList[usb - 1][name] = value;
        return state;
    },
    /**
     * 从列表中删除设备(根据USB序号删除)
     * usb序号从1开始
     * @param payload USB序号
     */
    removeDevice(state: any, { payload }: AnyAction) {

        state.deviceList = state.deviceList.map((item: DeviceType) => {
            if (helper.isNullOrUndefined(item)) {
                return undefined;
            } else if (item.usb == payload) {
                return undefined;
            } else {
                return item;
            }
        });
        return state;
    },
    /**
     * 进度消息追加到设备数据中
     * @param payload.usb USB序号（从1开始）
     * @param payload.fetchRecord 进度消息 FetchRecord对象
     */
    setRecordToDevice(state: any, { payload }: AnyAction) {

        const { usb, fetchRecord } = payload;
        let list = state.deviceList[usb - 1].fetchRecord;

        if (helper.isNullOrUndefined(list)) {
            list = [fetchRecord];
        } else {
            list.push(fetchRecord);
        }
        return state;
    },
    /**
     * 设置手机提示消息
     * @param payload.usb USB序号（从1开始）
     * @param payload.tipType 提示类型(TipType)
     * @param payload.tipMsg 消息内容(string)
     * @param payload.tipImage 提示图分类(GuideImage)
     * @param payload.tipRequired 消息是否必需回复(boolean)
     */
    setTip(state: any, { payload }: AnyAction) {
        const { usb, tipType, tipMsg, tipImage, tipRequired } = payload;
        state.deviceList[usb - 1].tipType = tipType;
        state.deviceList[usb - 1].tipMsg = tipMsg;
        state.deviceList[usb - 1].tipImage = tipImage;
        state.deviceList[usb - 1].tipRequired = tipRequired;
        return state;
    },
    /**
     * 清除手机提示消息
     * @param payload USB序号（从1开始）
     */
    clearTip(state: any, { payload }: AnyAction) {
        state.deviceList[payload - 1].tipType = TipType.Nothing;
        state.deviceList[payload - 1].tipMsg = '';
        state.deviceList[payload - 1].tipImage = undefined;
        state.deviceList[payload - 1].tipRequired = undefined;
        return state;
    }
}