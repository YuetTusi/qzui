import { AnyAction } from 'redux';
import { ApkModalState } from ".";

export default {
    /**
     * 设置apk列表 
     * @param {Apk[]} payload 设备列表
     */
    setApk(state: ApkModalState, { payload }: AnyAction) {
        state.apk = payload;
        return state;
    },
    /**
     * 设备手机列表
     */
    setPhone(state: ApkModalState, { payload }: AnyAction) {
        state.phone = payload;
        return state;
    },
    /**
     * 设置破解消息(追加)
     * @param {string} payload
     */
    setMessage(state: ApkModalState, { payload }: AnyAction) {
        state.message.unshift(payload);
        return state;
    },
    /**
     * 清空消息
     */
    clearMessage(state: ApkModalState) {
        state.message = [];
        return state;
    }
};