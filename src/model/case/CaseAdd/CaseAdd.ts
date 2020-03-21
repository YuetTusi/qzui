import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import { fetcher } from "@src/service/rpc";
import message from "antd/lib/message";
import { routerRedux } from "dva/router";

interface StoreState {
    /**
     * 保存状态
     */
    saving: boolean;
}

let model: Model = {
    namespace: "caseAdd",
    state: {
        saving: false
    },
    reducers: {
        setSaving(state: any, { payload }: AnyAction) {
            return {
                ...state,
                saving: payload
            }
        }
    },
    effects: {
        /**
         * 保存案件
         */
        *saveCase(action: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setSaving', payload: true });
            try {
                yield call([fetcher, 'invoke'], 'SaveCaseInfo', [action.payload]);
                yield put(routerRedux.push('/case'));
                message.success('保存成功');
            } catch (error) {
                console.error(`@modal/CaseAdd.ts/saveCase: ${error.message}`);
                message.error('保存失败');
            } finally {
                yield put({ type: 'setSaving', payload: false });
            }
        }
    }
};

export { StoreState };
export default model;