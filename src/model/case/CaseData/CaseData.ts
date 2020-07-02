import message from "antd/lib/message";
import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import Db from '@utils/db';
import CCaseInfo from "@src/schema/CCaseInfo";
import { helper } from '@src/utils/helper';
import { TableName } from "@src/schema/db/TableName";
import { Caller } from "@src/@hprose/rpc-plugin-reverse/src";

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
        pageSize: 10,
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
            const { current, pageSize } = payload;
            yield put({ type: 'setLoading', payload: true });
            try {
                const [result, total]: [CCaseInfo[], number] = yield all([
                    yield call([db, 'findByPage'], null, current, pageSize, 'createdAt', -1),
                    yield call([db, 'count'], null)
                ]);
                console.log(total, current, pageSize);
                //将时间戳拆分出来，转为创建时间列来显示
                let temp = result.map((item: CCaseInfo) => {
                    return {
                        ...item,
                        caseName: item.m_strCaseName.split('_')[0],
                        createTime: helper.parseDate(item.m_strCaseName.split('_')[1], 'YYYYMMDDHHmmss').format('YYYY年M月D日 HH:mm:ss')
                    }
                });
                yield put({ type: 'setCaseData', payload: temp });
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
                yield put({ type: 'fetchCaseData', payload: null });
            }
        },
        /**
         * 删除手机数据（传手机完整路径）
         */
        *deletePhoneData(action: AnyAction, { fork, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            try {
                message.info('正在删除...');
                yield put({ type: 'setLoading', payload: true });
                // yield fork([fetcher, 'invoke'], 'DeletePhoneInfo', [phonePath]);
            } catch (error) {
                console.log(`@modal/CaseData.ts/deletePhoneData: ${error.message}`);
            }
        }
    }
};

export { StoreModel };
export default model;