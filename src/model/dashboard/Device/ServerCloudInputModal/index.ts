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

/**
 * 采集录入框Model（点验版）
 */
let model: Model = {
    namespace: 'serverCloudInputModal',
    effects,
    reducers,
    state: {
        caseList: []
    }
};

export { StoreState };
export default model;