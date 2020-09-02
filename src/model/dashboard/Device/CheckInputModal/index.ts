import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import CCaseInfo from '@src/schema/CCaseInfo';

interface StoreState {
    /**
     * 按件下拉数据
     */
    caseList: CCaseInfo[];
}

let model: Model = {
    namespace: 'checkInputModal',
    effects,
    reducers,
    state: {
        caseList: []
    }
};

export { StoreState };
export default model;