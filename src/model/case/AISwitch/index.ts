import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import { Predict } from '@src/view/case/AISwitch';

interface AiSwitchState {
    isPhotoAnalysis: boolean,
    data: Predict[],
    similarity: number,
    ocr: boolean
}


let model: Model = {

    namespace: 'aiSwitch',
    state: {
        isPhotoAnalysis: false,
        data: [],
        similarity: 0,
        ocr: false
    },
    reducers,
    effects
};

export { AiSwitchState };
export default model;