import { AnyAction } from 'redux';
import { ipcRenderer } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import message from 'antd/lib/message';
import logger from '@utils/log';
import { helper } from '@src/utils/helper';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';
import { Officer as OfficerEntity } from '@src/schema/Officer';
import { BcpHistory } from '@src/schema/socket/BcpHistory';

const { caseText } = helper.readConf();

interface BcpModelState {
    /**
     * 案件
     */
    caseData: CCaseInfo,
    /**
     * 采集人员列表
     */
    officerList: OfficerEntity[],
    /**
     * 读取状态
     */
    loading: boolean,
    /**
     * 历史记录
     */
    bcpHistory: BcpHistory | null
}

/**
 * 生成BCP Model
 */
let model: Model = {

    namespace: 'bcp',
    state: {
        caseData: null,
        officerList: [],
        loading: false,
        bcpHistory: null
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
        /**
         * 更新采集人员列表
         * @param {OfficerEntity[]} payload 采集人员List
         */
        setOfficeList(state: any, { payload }: AnyAction) {
            state.officerList = payload;
            return state;
        },
        setLoading(state: any, { payload }: AnyAction) {
            state.loading = payload;
            return state;
        },
        setBcpHistory(state: any, { payload }: AnyAction) {
            state.bcpHistory = payload;
            return state;
        }
    },
    effects: {
        /**
         * 根据id查询案件
         * @param {string} payload 案件id
         */
        *queryCaseById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            yield put({ type: 'setLoading', payload: true });
            try {
                let caseData: CCaseInfo = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: payload });
                yield put({ type: 'setCaseData', payload: caseData });
            } catch (error) {
                message.error(`查询${caseText ?? '案件'}数据失败`);
                yield put({ type: 'setCaseData', payload: null });
                logger.error(`查询案件数据失败 @model/record/Display/Bcp/queryCaseById:${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 查询采集人员列表
         */
        *queryOfficerList({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            try {
                const officerList: OfficerEntity[] = yield call([ipcRenderer, 'invoke'], 'db-find', TableName.Officer, null, 'updatedAt', -1);
                yield put({ type: 'setOfficeList', payload: officerList });
            } catch (error) {
                yield put({ type: 'setOfficeList', payload: [] });
                logger.error(`查询采集人员列表失败 @model/record/Display/Bcp/queryOfficerList:${error.message}`);
            }
        },
        /**
         * 按设备id查询BCP记录
         * @param {string} payload.id 设备deviceId
         */
        *queryBcpHistory({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                const bcpHistory: BcpHistory = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.CreateBcpHistory, { deviceId: payload });
                yield put({ type: 'setBcpHistory', payload: bcpHistory });
            } catch (error) {
                logger.error(`查询BCP历史记录失败 @model/record/Display/Bcp/queryBcpHistory:${error.message}`);
                yield put({ type: 'setBcpHistory', payload: null });
            }
        },
        /**
         * 保存生成BCP历史记录
         * @param {BcpHistory} payload BcpHistory对象
         */
        *saveOrUpdateBcpHistory({ payload }: AnyAction, { call, fork }: EffectsCommandMap) {
            //note: 用设备id保存BCP生成记录，进入页面读取，自动填写相应的表单项
            try {
                const bcpHistory: BcpHistory = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.CreateBcpHistory, { deviceId: payload.deviceId });
                if (bcpHistory === null) {
                    //*insert
                    yield fork([ipcRenderer, 'invoke'], 'db-insert', TableName.CreateBcpHistory, payload);
                } else {
                    //*update
                    yield fork([ipcRenderer, 'invoke'], 'db-update', TableName.CreateBcpHistory, { deviceId: payload.deviceId }, payload);
                }
            } catch (error) {
                logger.error(`保存BCP历史记录失败 @model/record/Display/Bcp/saveOrUpdateBcpHistory:${error.message}`);
            }
        }
    }
};

export { BcpModelState };
export default model;