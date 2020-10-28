import { AnyAction } from 'redux';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import TipType from '@src/schema/socket/TipType';
import { StoreState } from './index';

/**
 * Reducers
 */
export default {
    /**
     * 更新案件数据是否为空
     * @param {boolean} payload
     */
    setEmptyCase(state: any, { payload }: AnyAction) {
        state.isEmptyCase = payload;
        return state;
    },
    /**
     * 覆盖设备列表
     * @param {DeviceType[]} payload
     */
    setDeviceList(state: any, { payload }: AnyAction) {
        state.deviceList = payload;
        return state;
    },
    /**
     * 更新设备到列表中
     * usb序号从1开始
     * @param {DeviceType} payload 设备(DeviceType)对象
     */
    setDeviceToList(state: any, { payload }: AnyAction) {
        state.deviceList[payload.usb - 1] = {
            ...state.deviceList[payload.usb - 1],
            ...payload
        };
        return state;
    },
    /**
     * 更新列表中某个设备的属性
     * usb序号从1开始
     * @param {number} payload.usb USB序号
     * @param {string} payload.name 属性名
     * @param {any} payload.value 属性值
     */
    updateProp(state: any, { payload }: AnyAction) {
        const { usb, name, value } = payload;
        state.deviceList[usb - 1][name] = value;
        return state;
    },
    /**
     * 更新是否有正在采集的设备
     * @param {boolean} payload
     */
    setHasFetching(state: StoreState, { payload }: AnyAction) {
        state.hasFetching = payload;
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
     * 设置手机提示消息
     * @param {number} payload.usb USB序号（从1开始）
     * @param {TipType} payload.tipType 提示类型
     * @param {string} payload.tipTitle 消息标题
     * @param {string} payload.tipContent 内容
     * @param {GuideImage} payload.tipImage 提示图
     * @param {ReturnButton} payload.tipYesButton 是按钮
     * @param {ReturnButton} payload.tipNoButton 否按钮
     */
    setTip(state: any, { payload }: AnyAction) {
        const { usb, tipType, tipTitle, tipContent, tipImage, tipYesButton, tipNoButton } = payload;
        state.deviceList[usb - 1].tipType = tipType;
        state.deviceList[usb - 1].tipTitle = tipTitle;
        state.deviceList[usb - 1].tipContent = tipContent;
        state.deviceList[usb - 1].tipImage = tipImage;
        state.deviceList[usb - 1].tipYesButton = tipYesButton;
        state.deviceList[usb - 1].tipNoButton = tipNoButton;
        return state;
    },
    /**
     * 清除手机提示消息
     * @param {number} payload USB序号（从1开始）
     */
    clearTip(state: any, { payload }: AnyAction) {
        state.deviceList[payload - 1].tipType = TipType.Nothing;
        state.deviceList[payload - 1].tipTitle = undefined;
        state.deviceList[payload - 1].tipContent = undefined;
        state.deviceList[payload - 1].tipImage = undefined;
        state.deviceList[payload - 1].tipYesButton = undefined;
        state.deviceList[payload - 1].tipNoButton = undefined;
        return state;
    }
}