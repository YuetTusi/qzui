import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { fetcher } from '@src/service/rpc';
import { apps } from '@src/config/view.config';

interface StoreState {
    /**
     * 当前编辑的案件对象
     */
    data: ExtendCaseInfo;
}

/**
 * 扩展App属性，用于绑定App组件
 */
class ExtendCaseInfo extends CCaseInfo {
    apps: any[] = [];
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
        /**
         * 设置是否自动解析值（true或false）
         */
        setAutoAnalysis(state: StoreState, { payload }: AnyAction) {
            console.log(payload);
            return {
                ...state,
                data: { ...state.data, m_bIsAutoParse: payload }
            };
        },
        /**
         * 设置是否生成BCP（true或false）
         */
        setGenerateBCP(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: { ...state.data, m_bIsGenerateBCP: payload }
            };
        },
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
            try {
                let data: CCaseInfo = yield call([fetcher, 'invoke'], 'GetSpecCaseInfo', [payload]);
                // let { fetch } = apps;
                // fetch.forEach((item: any) => {

                // });

                yield put({ type: 'setData', payload: data });
            } catch (error) {
                console.log(`查询失败：${error.message}`);
            }
        }
    }
};

export { StoreState, ExtendCaseInfo };
export default model;