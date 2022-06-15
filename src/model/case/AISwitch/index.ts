import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import { Predict } from '@src/view/case/AISwitch';

interface AiSwitchState {
    data: Predict[]
}

let model: Model = {

    namespace: 'aiSwitch',
    state: {
        data: []
    },
    reducers,
    effects
};

export { AiSwitchState };
export default model;