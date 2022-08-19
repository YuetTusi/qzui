import { AnyAction } from 'redux';
import { AiSwitchState } from './index';

export default {
    setData(state: AiSwitchState, { payload }: AnyAction) {
        state.data = payload;
        return state;
    },
    /**
     * 设置相似度
     */
    setSimilarity(state: AiSwitchState, { payload }: AnyAction) {
        state.similarity = payload;
        return state;
    }
}
