import { AnyAction } from 'redux';
import { AiSwitchState } from './index';

export default {
    setData(state: AiSwitchState, { payload }: AnyAction) {
        state.data = payload;
        return state;
    }
}
