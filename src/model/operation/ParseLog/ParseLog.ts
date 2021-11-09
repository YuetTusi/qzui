import { ipcRenderer } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import moment from 'moment';
import message from 'antd/lib/message';
import Db from '@src/utils/db';
import logger from '@src/utils/log';
import { helper } from '@src/utils/helper';
import { TableName } from '@src/schema/db/TableName';
import ParseLogEntity from '@src/schema/socket/ParseLog';
import { DelLogType } from '@src/view/operation/components/DelLogModal/ComponentType';

const defaultPageSize = 10;

interface StoreData {
    /**
     * 加载中
     */
    loading: boolean;
    /**
     * 表格数据
     */
    data: ParseLogEntity[];
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
}

/**
 * 解析日志Model
 */
let model: Model = {
    namespace: 'parseLog',
    state: {
        loading: false,
        data: [],
        total: 0,
        current: 1,
        pageSize: defaultPageSize
    },
    reducers: {
        setLoading(state: StoreData, { payload }: AnyAction) {
            state.loading = payload;
            return state;
        },
        setData(state: StoreData, { payload }: AnyAction) {
            state.data = payload;
            return state;
        },
        setPage(state: StoreData, { payload }: AnyAction) {
            state.current = payload.current;
            state.pageSize = payload.pageSize;
            state.total = payload.total;
            return state;
        }
    },
    effects: {
        /**
         * 查询解析日志
         */
        *queryParseLog({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
            const { condition, current, pageSize } = payload;

            let q: any = {};
            if (Db.isEmptyCondition(condition)) {
                q = {};
            } else {
                if (!helper.isNullOrUndefined(condition?.start)) {
                    q = {
                        endTime: {
                            ...q?.endTime,
                            $gte: condition?.start.toDate()
                        }
                    };
                }
                if (!helper.isNullOrUndefined(condition?.end)) {
                    q = {
                        endTime: {
                            ...q?.endTime,
                            $lte: condition?.end.toDate()
                        }
                    };
                }
            }

            yield put({ type: 'setLoading', payload: true });
            try {
                let [data, total]: [ParseLogEntity[], number] = yield all([
                    call([ipcRenderer, 'invoke'], 'db-find-by-page', TableName.ParseLog, q, current, pageSize, 'endTime', -1),
                    call([ipcRenderer, 'invoke'], 'db-count', TableName.ParseLog, q)
                ]);
                yield put({ type: 'setData', payload: data });
                yield put({
                    type: 'setPage', payload: {
                        current: payload.current,
                        pageSize: payload.pageSize,
                        total
                    }
                });
            } catch (error) {
                console.log(error);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 根据时间删除日志
         */
        *deleteParseLogByTime({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setLoading', payload: true });
            let time: Date | undefined;
            switch (payload) {
                case DelLogType.TwoYearsAgo:
                    time = new Date(moment().subtract(2, 'years').toDate());
                    break;
                case DelLogType.OneYearAgo:
                    time = new Date(moment().subtract(1, 'years').toDate());
                    break;
                case DelLogType.SixMonthsAgo:
                    time = new Date(moment().subtract(6, 'months').toDate());
                    break;
            }
            try {
                yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.ParseLog, {
                    endTime: { $lt: time }
                }, true);
                if (time === undefined) {
                    message.error('日志清理失败');
                    yield put({ type: 'setLoading', payload: false });
                } else {
                    message.success('日志清理成功');
                    yield put({ type: 'queryParseLog', payload: { condition: {}, current: 1, pageSize: defaultPageSize } });
                }
            } catch (error) {
                message.error('日志清理失败');
                yield put({ type: 'setLoading', payload: false });
                logger.error(`日志删除失败 @modal/operation/ParseLog.ts/deleteParseLogByTime: ${error.message}`);
            }
        },
        /**
         * 删除一条日志记录(管理员)
         * @param {string} payload id
         */
        *dropById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            try {
                yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.ParseLog, { _id: payload });
                message.success('删除成功');
                yield put({
                    type: 'queryParseLog', payload: {
                        condition: null,
                        current: 1,
                        pageSize: defaultPageSize
                    }
                });
            } catch (error) {
                message.error(`删除失败, ${error.message}`);
                logger.error(`解析日志删除失败 @model/operation/ParseLog/dropLogById: ${error.message}`);
            }
        },
        /**
         * 清空所有日志记录(管理员)
         */
        *dropAllLog({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            try {
                yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.ParseLog, {}, true);
                message.success('日志清除成功');
                yield put({
                    type: 'queryParseLog', payload: {
                        condition: null,
                        current: 1,
                        pageSize: defaultPageSize
                    }
                });
            } catch (error) {
                message.error(`日志清除失败, ${error.message}`);
                logger.error(`解析日志清除失败 @model/operation/ParseLog/dropAllLog: ${error.message}`);
            }
        }
    }
};

export { StoreData };
export default model;