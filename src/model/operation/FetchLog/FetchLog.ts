import { Model, EffectsCommandMap } from 'dva';
import moment from 'moment';
import { AnyAction } from "redux";
import CFetchLog from '@src/schema/CFetchLog';
import Db from '@utils/Db';
import { helper } from '@src/utils/helper';

interface StoreData {
    /**
     * 表格数据
     */
    data: CFetchLog[];
    /**
     * 总记录条数
     */
    total: number;
    /**
     * 当前页
     */
    current: number;
    /**
     * 分页尺寸
     */
    pageSize: number;
    /**
     * 读取状态
     */
    loading: boolean;
}

/**
 * 采集日志仓库模型
 */
let model: Model = {
    namespace: 'fetchLog',
    state: {
        data: [],
        total: 0,
        current: 1,
        pageSize: 15,
        loading: false
    },
    reducers: {
        setData(state: any, { payload }: AnyAction) {
            return {
                ...state,
                data: [...payload]
            };
        },
        setPage(state: any, { payload }: AnyAction) {
            return {
                ...state,
                total: payload.total,
                current: payload.current,
                pageSize: payload.pageSize
            }
        },
        setLoading(state: any, { payload }: AnyAction) {
            return {
                ...state,
                loading: payload
            };
        }
    },
    effects: {
        /**
         * 查询全部采集日志数据
         */
        *queryAllFetchLog({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
            const db = new Db('FetchLog');
            const { condition, current, pageSize } = payload;
            yield put({ type: 'setLoading', payload: true });
            try {

                let $condition: any = null;
                if (helper.isNullOrUndefined(condition?.start) && helper.isNullOrUndefined(condition?.end)) {
                    $condition = {};
                } else {
                    $condition = { m_strFinishTime: {} };
                    if (!helper.isNullOrUndefined(condition?.start)) {
                        $condition = {
                            m_strFinishTime: {
                                ...$condition.m_strFinishTime,
                                $gte: condition.start
                            }
                        };
                    }
                    if (!helper.isNullOrUndefined(condition?.end)) {
                        $condition = {
                            m_strFinishTime: {
                                ...$condition.m_strFinishTime,
                                $lte: condition.end
                            }
                        };
                    }
                }
                let [data, total] = yield all([
                    call([db, 'findByPage'], $condition, current, pageSize, 'm_strFinishTime', -1),
                    call([db, 'count'], $condition)
                ]);
                yield put({ type: 'setData', payload: data });
                yield put({
                    type: 'setPage', payload: {
                        total,
                        current,
                        pageSize
                    }
                });
            } catch (error) {
                console.log(error.message);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { StoreData };
export default model;
