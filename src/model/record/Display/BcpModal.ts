import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { CBCPInfo } from '@src/schema/CBCPInfo';
import { fetcher } from '@src/service/rpc';

interface StoreState {
    /**
     * 检验单位列表
     */
    unitList: CCheckOrganization[];
    /**
     * BCP数据
     */
    bcpInfo: CBCPInfo;
}

/**
 * BCP录入框模型,对应组件：view/record/Display/components/BcpModal
 */
let model: Model = {
    namespace: 'bcpModal',
    state: {
        unitList: [],
        bcpInfo: {}
    },
    reducers: {
        setUnitList(state: any, action: AnyAction) {
            return {
                ...state,
                unitList: [...action.payload]
            };
        },
        setBcpInfo(state: any, action: AnyAction) {
            return {
                ...state,
                bcpInfo: { ...action.payload }
            }
        }
    },
    effects: {
        /**
         * 查询检验单位下拉数据
         */
        *queryUnitData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([fetcher, 'invoke'], 'GetCheckOrganizationList', [payload, 0]);
                yield put({ type: 'setUnitList', payload: result });
            } catch (error) {
                console.log(`@modal/record/Display/BcpModal.ts/queryUnitData:${error.message}`);
            }
        },
        /**
         * 查询BCP数据
         * @param payload 手机绝对路径
         */
        *queryBcp({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result: CBCPInfo = yield call([fetcher, 'invoke'], 'GetBCPInfo', [payload]);
                yield put({ type: 'setBcpInfo', payload: result });
            } catch (error) {
                console.log(`@modal/record/Display/BcpModal.ts/queryBcp:${error.message}`);
            }
        }
    }
};

export { StoreState };
export default model;