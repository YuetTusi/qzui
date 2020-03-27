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
        pageSize: 20,
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
        *queryAllFetchLog({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db('FetchLog');
            const { condition, current, pageSize } = payload;
            yield put({ type: 'setLoading', payload: true });
            try {

                let $condition: any = null;
                if (helper.isNullOrUndefined(condition?.start) && helper.isNullOrUndefined(condition?.end)) {
                    $condition = {};
                } else {
                    if (!helper.isNullOrUndefined(condition?.start)) {
                        $condition = { m_strFinishTime: { $gte: condition.start } };
                    }
                    if (!helper.isNullOrUndefined(condition?.end)) {
                        $condition = { m_strFinishTime: { $lte: condition.end } };
                    }
                }
                let data: CFetchLog[] = yield call([db, 'findByPage'], $condition, current, pageSize, 'm_strFinishTime', -1);
                let total: number = yield call([db, 'count'], $condition);
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
        },
        /**
         * 查询时间范围内的日志
         */
        *queryByDateRange({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const { start, end } = payload;
            const db = new Db('FetchLog');
            yield put({ type: 'setLoading', payload: true });
            if (start === null && end === null) {
                yield put({ type: 'queryAllFetchLog' });
            } else {
                let condition: any = {};
                if (!helper.isNullOrUndefined(start)) {
                    condition['$gte'] = start;
                }
                if (!helper.isNullOrUndefined(end)) {
                    condition['$lte'] = end;
                }
                try {
                    let data: CFetchLog[] = yield call([db, 'find'], {
                        'm_strFinishTime': condition
                    });
                    //按完成时间倒序
                    yield put({
                        type: 'setData', payload: data.sort((a, b) => {
                            return moment(a.m_strFinishTime).isAfter(moment(b.m_strFinishTime)) ? -1 : 1;
                        })
                    });
                } catch (error) {
                    console.log(error.message);
                } finally {
                    yield put({ type: 'setLoading', payload: false });
                }
            }
        }
    }
};

export { StoreData };
export default model;
