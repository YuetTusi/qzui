import { AnyAction } from 'redux';
import { AndroidSetModalState } from ".";

export default {
    /**
     * 设置设备列表 
     * @param {Dev[]} payload 设备列表
     */
    setDev(state: AndroidSetModalState, { payload }: AnyAction) {
        state.dev = payload;
        return state;
    },
    /**
     * 设置消息(追加)
     * @param {string} payload
     */
    setMessage(state: AndroidSetModalState, { payload }: AnyAction) {
        state.message.unshift(payload);
        return state;
    },
    /**
     * 清空消息
     */
    clearMessage(state: AndroidSetModalState) {
        state.message = [];
        return state;
    }
}