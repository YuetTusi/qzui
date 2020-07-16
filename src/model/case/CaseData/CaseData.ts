import message from "antd/lib/message";
import moment from 'moment';
import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import Db from '@utils/db';
import CCaseInfo from "@src/schema/CCaseInfo";
import { helper } from '@src/utils/helper';
import { TableName } from "@src/schema/db/TableName";

const PAGE_SIZE = 10;

/**
 * 仓库Model
 */
interface StoreModel {
    /**
     * 总记录数
     */
    total: number;
    /**
     * 当前页
     */
    current: number;
    /**
     * 页尺寸
     */
    pageSize: number;
    /**
     * 案件数据
     */
    caseData: any[];
    /**
     * 加载中
     */
    loading: boolean;
}

/**
 * 案件信息Model
 */
let model: Model = {
    namespace: 'caseData',
    state: {
        //案件表格数据
        caseData: [],
        total: 0,
        current: 1,
        pageSize: PAGE_SIZE,
        loading: false
    },
    reducers: {
        setCaseData(state: any, action: AnyAction) {
            return {
                ...state,
                caseData: [...action.payload]
            }
        },
        setPage(state: any, { payload }: AnyAction) {
            return {
                ...state,
                total: payload.total,
                current: payload.current,
                pageSize: payload.pageSize,
            };
        },
        setLoading(state: any, action: AnyAction) {
            return {
                ...state,
                loading: action.payload
            }
        }
    },
    effects: {
        /**
         * 查询案件列表
         */
        *fetchCaseData({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            const { current, pageSize = PAGE_SIZE } = payload;
            yield put({ type: 'setLoading', payload: true });
            try {
                const [result, total]: [CCaseInfo[], number] = yield all([
                    yield call([db, 'findByPage'], null, current, pageSize, 'createdAt', -1),
                    yield call([db, 'count'], null)
                ]);
                yield put({ type: 'setCaseData', payload: result });
                yield put({ type: 'setPage', payload: { current, pageSize, total } });
            } catch (error) {
                console.log(`@modal/CaseData.ts/fetchCaseData: ${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 删除案件记录(payload为NeDB_id)
         */
        *deleteCaseData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            try {
                yield put({ type: 'setLoading', payload: true });
                yield call([db, 'remove'], { _id: payload });
                message.success('删除成功');
            } catch (error) {
                console.log(`@modal/CaseData.ts/deleteCaseData: ${error.message}`);
                message.error('删除失败');
            } finally {
                yield put({
                    type: 'fetchCaseData', payload: {
                        current: 1,
                        pageSize: PAGE_SIZE
                    }
                });
            }
        },
        /**
         * 删除手机数据
         */
        *deleteDevice({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);

            try {
                yield put({ type: 'setLoading', payload: true });
                let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: payload.caseId });
                let updatedDevices = caseData.devices.filter(item => item.mobileName !== payload.data.mobileName);
                caseData.devices = updatedDevices;
                yield call([db, 'update'], { _id: payload.caseId }, caseData);
                yield put({ type: 'fetchCaseData', payload: { current: 1, pageSize: PAGE_SIZE } });
                message.success('删除成功');

            } catch (error) {
                console.log(`@modal/CaseData.ts/deleteDevice: ${error.message}`);
                message.error('删除失败');
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { StoreModel };
export default model;