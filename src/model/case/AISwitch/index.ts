import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import { Predict } from '@src/view/case/AISwitch';

interface AiSwitchState {
    data: Predict[],
    similarity: number
}


let model: Model = {

    namespace: 'aiSwitch',
    state: {
        data: [],
        similarity: 0
    },
    reducers,
    effects
};

export { AiSwitchState };
export default model;