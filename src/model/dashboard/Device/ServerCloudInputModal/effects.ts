import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import log from '@utils/log';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo, { CaseType } from '@src/schema/CCaseInfo';

export default {
    /**
     * 查询案件下拉列表数据
     */
    *queryCaseList({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

        try {
            let caseList: CCaseInfo[] = yield call(
                [ipcRenderer, 'invoke'],
                'db-find',
                TableName.Case,
                {
                    $not: { caseType: CaseType.QuickCheck }
                },
                'createdAt',
                -1);
            yield put({ type: 'setCaseList', payload: caseList });
        } catch (error) {
            log.error(`绑定案件数据出错 @model/dashboard/Device/CheckInputModal/queryCaseList: ${error.message}`);
        }
    }
};