import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { fetcher } from '@src/service/rpc';

interface StoreState {
    /**
     * 检验单位列表
     */
    unitList: CCheckOrganization[];
}

/**
 * BCP录入框模型,对应组件：view/record/Display/components/BcpModal
 */
let model: Model = {
    namespace: 'bcpModal',
    state: {
        unitList: []
    },
    reducers: {
        setUnitList(state: any, action: AnyAction) {
            return {
                ...state,
                unitList: [...action.payload]
            };
        }
    },
    effects: {
        /**
         * 查询检验单位下拉数据
         */
        *queryUnitData(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([fetcher, 'invoke'], 'GetCheckOrganizationList', [action.payload, 0]);
                yield put({ type: 'setUnitList', payload: result });
            } catch (error) {
                console.log(`@modal/record/Display/BcpModal.ts/queryUnitData:${error.message}`);
            }
        },
    }
};

export { StoreState };
export default model;