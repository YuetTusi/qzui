import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { fetcher } from '@src/service/rpc';

interface StoreState {
    /**
     * 当前编辑的案件对象
     */
    data: CCaseInfo;
}

/**
 * 案件编辑model
 */
let model: Model = {
    namespace: 'caseEdit',
    state: {
        data: {}
    },
    reducers: {
        setData(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: { ...payload }
            }
        }
    },
    effects: {
        /**
         * 传路径查询案件对象
         */
        *queryCaseByPath({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            console.log(payload);
            try {
                let data: CCaseInfo = yield call([fetcher, 'invoke'], 'GetSpecCaseInfo', [payload]);
                console.log(data);
                yield put({ type: 'setData', payload: data });
            } catch (error) {
                console.log(`查询失败：${error.message}`);
            }
        }
    }
};

export { StoreState };
export default model;