import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import Db from '@utils/db';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo from '@src/schema/CCaseInfo';
import Officer from '@src/schema/Officer';
import log from '@utils/log';

export default {
    /**
     * 查询案件下拉列表数据
     */
    *queryCaseList({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

        const db = new Db<CCaseInfo>(TableName.Case);
        try {
            let caseList: CCaseInfo[] = yield call([db, 'find'], null);
            yield put({ type: 'setCaseList', payload: caseList });
        } catch (error) {
            log.error(`查询案件下拉出错,错误消息: ${error.message}`);
        }
    },
    /**
     * 查询检验员下拉
     */
    *queryOfficerList({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const db = new Db<Officer>(TableName.Officer);
        try {
            let list: Officer[] = yield call([db, 'find'], null);
            yield put({ type: 'setOfficerList', payload: list });
        } catch (error) {
            log.error(`查询检验员下拉出错,错误消息: ${error.message}`);
        }
    }
};