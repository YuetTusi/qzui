import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';
import { Officer } from '@src/schema/Officer';
import logger from '@utils/log';
import Db from '@utils/db';

interface StoreData {
    /**
     * 案件列表
     */
    caseList: CCaseInfo[];
    /**
     * 检验员列表
     */
    officerList: Officer[];
}

/**
 * 导入数据输入框
 */
let model: Model = {
    namespace: 'importDataModal',
    state: {
        caseList: [],
        officerList: []
    },
    reducers: {
        setCaseList(state: any, action: AnyAction) {
            return { ...state, caseList: [...action.payload] };
        },
        setOfficerList(state: any, action: AnyAction) {
            return { ...state, officerList: [...action.payload] };
        }
    },
    effects: {
        /**
         * 查询案件下拉列表数据
         */
        *queryCaseList(action: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            try {
                let list: CCaseInfo[] = yield call([db, 'find'], null);
                yield put({ type: 'setCaseList', payload: list });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryCaseList:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryCaseList: ${error.stack}` });
            }
        },
        /**
         * 查询采集人员下拉数据
         */
        *queryOfficerList(action: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<Officer>(TableName.Officer);
            try {
                let result: Officer[] = yield call([db, 'find'], null);
                yield put({ type: 'setOfficerList', payload: result });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryOfficerList:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryOfficerList: ${error.stack}` });
            }
        }
    }
};

export { StoreData };
export default model;