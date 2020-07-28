import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import Db from '@utils/db';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo from '@src/schema/CCaseInfo';
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
            log.error(`绑定案件数据出错 @model/dashboard/Device/CaseInputMdal/queryCaseList: ${error.message}`);
        }
    }
};