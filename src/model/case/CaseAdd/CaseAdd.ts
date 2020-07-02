import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import message from "antd/lib/message";
import { routerRedux } from "dva/router";
import localStore from "@src/utils/localStore";
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { TableName } from '@src/schema/db/TableName';
import { helper } from "@src/utils/helper";
import Db from '@utils/db';
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
            const db = new Db(TableName.Case);
            yield put({ type: 'setSaving', payload: true });
            let unitName: string[] = UserHistory.get(HistoryKeys.HISTORY_UNITNAME);
            let unitNameSet = null;
            if (helper.isNullOrUndefined(unitName)) {
                unitNameSet = new Set([payload.m_strCheckUnitName]);
            } else {
                unitNameSet = new Set([payload.m_strCheckUnitName, ...unitName]);
            }
            localStore.set(HistoryKeys.HISTORY_UNITNAME, Array.from(unitNameSet)); //将用户输入的单位名称记录到本地存储中，下次输入可读取

            try {
                console.log(payload);
                yield call([db, 'insert'], payload);
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