import { mkdirSync } from 'fs';
import path from 'path';
import { remote } from 'electron';
import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import message from "antd/lib/message";
import { routerRedux } from "dva/router";
import { Officer as OfficerEntity } from '@src/schema/Officer';
import logger from '@src/utils/log';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { TableName } from '@src/schema/db/TableName';
import { helper } from "@src/utils/helper";
import CCaseInfo from '@src/schema/CCaseInfo';
import { DbInstance } from '@src/type/model';

const getDb = remote.getGlobal('getDb');

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
        *saveCase({ payload }: AnyAction, { call, fork, put }: EffectsCommandMap) {
            const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
            const casePath = path.join(payload.m_strCasePath, payload.m_strCaseName);
            yield put({ type: 'setSaving', payload: true });
            //#部分表单域记录历史，下次可快速输入
            UserHistory.set(HistoryKeys.HISTORY_UNITNAME, payload.m_strCheckUnitName);

            try {
                yield call([db, 'insert'], payload);
                yield put(routerRedux.push('/case'));
                let exist = yield helper.existFile(casePath);
                if (!exist) {
                    //案件路径不存在，创建之
                    mkdirSync(casePath);
                }
                yield fork([helper, 'writeJSONfile'], path.join(casePath, 'Case.json'), {
                    caseName: payload.m_strCaseName ?? '',
                    checkUnitName: payload.m_strCheckUnitName ?? '',
                    officerName: payload.officerName ?? '',
                    officerNo: payload.officerNo ?? '',
                    securityCaseNo: payload.securityCaseNo ?? '',
                    securityCaseType: payload.securityCaseType ?? '',
                    securityCaseName: payload.securityCaseName ?? '',
                    handleCaseNo: payload.handleCaseNo ?? '',
                    handleCaseName: payload.handleCaseName ?? '',
                    handleCaseType: payload.handleCaseType ?? '',
                    handleOfficerNo: payload.handleOfficerNo ?? ''
                });
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
            const db: DbInstance<OfficerEntity> = getDb(TableName.Officer);
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