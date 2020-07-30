import { AnyAction } from 'redux';
import { Model } from 'dva';

interface ProgressModalState {
    /**
     * 进度消息
     */
    info: string;
}

let model: Model = {

    namespace: 'progressModal',
    state: {
        info: ''
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