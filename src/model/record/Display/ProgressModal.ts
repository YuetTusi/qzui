import { AnyAction } from 'redux';
import { Model } from 'dva';
import ParseDetail from '@src/schema/socket/ParseDetail';

interface ProgressModalState {
    /**
     * 进度消息
     * 数组中每一条对应一个设备
     * 如数组有2条表示有同时两部设备正在解析
     * 用deviceId来做区分
     */
    info: ParseDetail[];
}

let model: Model = {

    namespace: 'progressModal',
    state: {
        info: []
    },
    reducers: {
        setInfo(state: any, { payload }: AnyAction) {
            state.info = payload;
            return state;
        }
    }
};

export { ProgressModalState };
export default model;