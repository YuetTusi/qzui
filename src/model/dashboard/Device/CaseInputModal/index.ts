import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import subscriptions from './subscriptions';
import CCaseInfo from '@src/schema/CCaseInfo';

interface StoreState {
    /**
     * 按件下拉数据
     */
    caseList: CCaseInfo[];
}

let model: Model = {
    namespace: 'caseInputModal',
    state: {
        caseList: []
    },
    reducers,
    effects,
    subscriptions
};

export { StoreState };
export default model;