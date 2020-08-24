import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import message from "antd/lib/message";
import { routerRedux } from "dva/router";
import { Officer as OfficerEntity } from '@src/schema/Officer';
import Db from '@utils/db';
import logger from '@src/utils/log';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { TableName } from '@src/schema/db/TableName';

interface StoreState {
    /**
     * 保存状态
     */
    saving: boolean;
    /**
     * 采集人员Options
     */
    officerList: OfficerEntity[];
}

let model: Model = {
    namespace: "caseAdd",
    state: {
        saving: false,
        officerList: []
    },
    reducers: {
        setSaving(state: any, { payload }: AnyAction) {
            state.saving = payload;
            return state;
        },
        setOfficerList(state: any, { payload }: AnyAction) {
            state.officerList = payload;
            return state;
        }
    },
    effects: {
        /**
         * 保存案件
         */
        *saveCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db(TableName.Case);
            yield put({ type: 'setSaving', payload: true });
            //#部分表单域记录历史，下次可快速输入
            UserHistory.set(HistoryKeys.HISTORY_UNITNAME, payload.m_strCheckUnitName);

            try {
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
        },
        /**
         * 查询采集人员
         */
        *queryOfficer({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<OfficerEntity>(TableName.Officer);
            try {
                let data: OfficerEntity[] = yield call([db, 'find'], {});
                yield put({ type: 'setOfficerList', payload: data });
            } catch (error) {
                logger.error(`查询采集人员列表失败 @model/case/CaseAdd/queryOfficer:${error.message}`);
            }
        }
    }
};

export { StoreState };
export default model;