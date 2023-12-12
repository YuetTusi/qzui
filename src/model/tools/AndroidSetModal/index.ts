import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';

interface Dev {
    /**
     * 
     */
    name: string,
    /**
     * 
     */
    value: string
}

interface AndroidSetModalState {

    dev: Dev[],
    message: string[]
}

/**
 * 设备破解弹框
 */
let model: Model = {
    namespace: 'androidSetModal',
    state: {
        dev: [],
        message: []
    },
    reducers,
    effects
};

export { Dev, AndroidSetModalState };
export default model;