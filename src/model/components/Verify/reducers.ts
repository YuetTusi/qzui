import { AnyAction } from 'redux';
import { HumanVerifyStoreState } from '.';

export default {

    /**
     * 设置图形验证数据
     * @param {number} payload.usb USB序号 
     * @param {VerifyDataParam} payload.verifyData 图形验证参数
     * @returns 
     */
    setVerifyData(state: HumanVerifyStoreState, { payload }: AnyAction) {
        state.usb = payload.usb;
        state.verifyData = payload.verifyData;
        return state;
    },
    /**
     * 清空图形验证数据（verifyData为null不显示图形验证框）
     */
    clearVerifyData(state: HumanVerifyStoreState) {
        state.usb = 0;
        state.verifyData = null;
        return state;
    }
};