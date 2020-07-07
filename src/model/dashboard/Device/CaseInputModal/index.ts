import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import subscriptions from './subscriptions';
import CCaseInfo from '@src/schema/CCaseInfo';
import Officer from '@src/schema/Officer';

interface StoreState {
    /**
     * 按件下拉数据
     */
    caseList: CCaseInfo[];
    /**
     * 检验员下拉数据
     */
    officerList: Officer[];
}

let model: Model = {
    namespace: 'caseInputModal',
    state: {
        caseList: [],
        officerList: []
    },
    reducers,
    effects,
    subscriptions
};

export { StoreState };
export default model;