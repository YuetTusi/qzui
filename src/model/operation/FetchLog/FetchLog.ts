import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from "redux";
import moment, { Moment } from 'moment';
import { message } from 'antd';
import FetchLog from '@src/schema/socket/FetchLog';
import { DelLogType } from '@src/view/operation/components/DelLogModal/ComponentType';
import Db from '@utils/Db';
import { TableName } from '@src/schema/db/TableName';
import { helper } from '@src/utils/helper';
import logger from '@src/utils/log';

interface StoreData {
    /**
     * 表格数据
     */
    data: FetchLog[];
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
            const db = new Db<FetchLog>(TableName.FetchLog);
            const { condition, current, pageSize } = payload;
            let $condition: any = null;
            if (Db.isEmptyCondition(condition)) {
                $condition = {};
            } else {
                $condition = { fetchTime: {} };
                if (!helper.isNullOrUndefined(condition?.start)) {
                    $condition = {
                        fetchTime: {
                            ...$condition.fetchTime,
                            $gte: moment(condition.start, 'YYYY-MM-DD HH:mm:ss')
                        }
                    };
                }
                if (!helper.isNullOrUndefined(condition?.end)) {
                    $condition = {
                        fetchTime: {
                            ...$condition.fetchTime,
                            $lte: moment(condition.end, 'YYYY-MM-DD HH:mm:ss')
                        }
                    };
                }
            }
            yield put({ type: 'setLoading', payload: true });
            try {
                let [data, total]: [FetchLog[], number] = yield all([
                    call([db, 'findByPage'], $condition, current, pageSize, 'fetchTime', -1),
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
        },
        /**
         * 根据时间删除日志
         */
        *deleteFetchLogByTime({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setLoading', payload: true });
            const db = new Db<FetchLog>(TableName.FetchLog);
            let time: any = null;
            switch (payload) {
                case DelLogType.TwoYearsAgo:
                    time = moment().subtract(2, 'years');
                    break;
                case DelLogType.OneYearAgo:
                    time = moment().subtract(1, 'years');
                    break;
                case DelLogType.SixMonthsAgo:
                    time = moment().subtract(6, 'months');
                    break;
            }
            try {
                yield call([db, 'remove'], {
                    fetchTime: {
                        $lt: time
                    }
                }, true);
                message.success('日志清理成功');
                yield put({ type: 'queryAllFetchLog', payload: { condition: {}, current: 1, pageSize: 15 } });
            } catch (error) {
                message.success('日志清理失败');
                logger.error(`日志删除失败 @modal/operation/FetchLog.ts/deleteFetchLogByTime: ${error.message}`);
            }
        }
    }
};

export { StoreData };
export default model;
