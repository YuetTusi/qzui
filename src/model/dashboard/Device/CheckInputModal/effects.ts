import { remote } from 'electron';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { DbInstance } from '@type/model';
import { helper } from '@utils/helper';
import log from '@utils/log';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';

const getDb = remote.getGlobal('getDb');

export default {
    /**
     * 查询案件下拉列表数据
     */
    *queryCaseList({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

        const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
        try {
            let caseList: CCaseInfo[] = yield call([db, 'find'], null);
            yield put({ type: 'setCaseList', payload: caseList });
        } catch (error) {
            log.error(`绑定案件数据出错 @model/dashboard/Device/CheckInputModal/queryCaseList: ${error.message}`);
        }
    },
    /**
     * 录入点验设备记录
     * 用户采集时录入当前设备，下次采集时若存在直接走流程，免去用户再次输入
     * @param {FetchData} payload 采集设备数据
     */
    *insertCheckData({ payload }: AnyAction, { fork }: EffectsCommandMap) {
        const db: DbInstance<FetchData> = getDb(TableName.CheckData);
        if (helper.isNullOrUndefined(payload.serial)) {
            log.error(`点验数据入库失败,序列号为空 @model/dashboard/Device/CheckInputModal/insertCheckData`);
            return;
        }
        try {
            yield fork([db, 'insert'], payload);
        } catch (error) {
            log.error(`点验数据入库失败 @model/dashboard/Device/CheckInputModal/insertCheckData: ${error.message}`);
        }
    }
};