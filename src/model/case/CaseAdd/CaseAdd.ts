import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import { fetcher } from "@src/service/rpc";
import message from "antd/lib/message";
import { routerRedux } from "dva/router";
import localStore from "@src/utils/localStore";
import { helper } from "@src/utils/helper";
import logger from '@src/utils/log';

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
        *saveCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setSaving', payload: true });
            let unitName: string[] = localStore.get('HISTORY_UNITNAME');
            let unitNameSet = null;
            if (helper.isNullOrUndefined(unitName)) {
                unitNameSet = new Set([payload.m_strCheckUnitName]);
            } else {
                unitNameSet = new Set([payload.m_strCheckUnitName, ...unitName]);
            }
            localStore.set('HISTORY_UNITNAME', Array.from(unitNameSet)); //将用户输入的单位名称记录到本地存储中，下次输入可读取

            try {
                yield call([fetcher, 'invoke'], 'SaveCaseInfo', [payload]);
                yield put(routerRedux.push('/case'));
                message.success('保存成功');
            } catch (error) {
                console.error(`@modal/CaseAdd.ts/saveCase: ${error.message}`);
                logger.error(`@modal/CaseAdd.ts/saveCase:${error.message}`);
                message.error('保存失败');
            } finally {
                yield put({ type: 'setSaving', payload: false });
            }
        }
    }
};

export { StoreState };
export default model;