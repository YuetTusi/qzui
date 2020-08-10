import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import message from 'antd/lib/message';
import Db from '@utils/db';
import logger from '@utils/log';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';

interface BcpModelState {
    /**
     * 案件
     */
    caseData: CCaseInfo,
    /**
     * 读取状态
     */
    loading: boolean
}

/**
 * 生成BCP
 */
let model: Model = {

    namespace: 'bcp',
    state: {
        caseData: null,
        loading: false
    },
    reducers: {
        /**
         * 更新案件数据
         * @param {CCaseInfo} payload 案件数据
         */
        setCaseData(state: any, { payload }: AnyAction) {
            state.caseData = payload;
            return state;
        },
        setLoading(state: any, { payload }: AnyAction) {
            state.loading = payload;
            return state;
        }
    },
    effects: {
        /**
         * 根据id查询案件
         * @param {string} payload 案件id
         */
        *queryCaseById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            const db = new Db<CCaseInfo>(TableName.Case);
            yield put({ type: 'setLoading', payload: true });

            try {
                let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: payload });
                yield put({ type: 'setCaseData', payload: caseData });
            } catch (error) {
                message.error('查询案件数据失败');
                yield put({ type: 'setCaseData', payload: null });
                logger.error(`查询案件数据失败 @model/record/Display/Bcp/queryCaseById:${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { BcpModelState };
export default model;