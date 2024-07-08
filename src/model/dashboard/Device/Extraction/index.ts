import { Model } from 'dva';
import reducers from './reducers';

/**
 * 设备提取方式
 */
interface ExtractionState {
    types: { name: string, value: string }[]
}


let model: Model = {
    namespace: 'extraction',
    state: {
        types: []
    },
    reducers
};

export { ExtractionState };
export default model;