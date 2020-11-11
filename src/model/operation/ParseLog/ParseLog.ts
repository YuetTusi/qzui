import { remote } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import moment from 'moment';
import message from 'antd/lib/message';
import logger from '@src/utils/log';
import { helper } from '@src/utils/helper';
import { TableName } from '@src/schema/db/TableName';
import ParseLogEntity from '@src/schema/socket/ParseLog';
import { DelLogType } from '@src/view/operation/components/DelLogModal/ComponentType';
import { DbInstance } from '@src/type/model';

const Db = remote.getGlobal('Db');
const getDb = remote.getGlobal('getDb');

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
        pageSize: 15
    },
    reducers: {
        setLoading(state: any, { payload }: AnyAction) {
            return { ...state, loading: payload };
        },
        setData(state: any, { payload }: AnyAction) {
            return {
                ...state,
                data: [...payload]
            };
        },
        setPage(state: any, { payload }: AnyAction) {
            return {
                ...state,
                data: {
                    current: payload.current,
                    pageSize: payload.pageSize
                }
            };
        },
        setTotal(state: any, { payload }: AnyAction) {
            return {
                ...state,
                total: payload
            };
        }
    },
    effects: {
        /**
         * 查询解析日志
         */
        *queryParseLog({ payload }: AnyAction, { call, fork, put }: EffectsCommandMap) {
            const { condition, current, pageSize } = payload;

            let q: any = {};
            if (Db.isEmptyCondition(condition)) {
                q = {};
            } else {
                if (!helper.isNullOrUndefined(condition?.start)) {
                    q = {
                        endTime: {
                            ...q?.endTime,
                            $gte: condition?.start.format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                }
                if (!helper.isNullOrUndefined(condition?.end)) {
                    q = {
                        endTime: {
                            ...q?.endTime,
                            $lte: condition?.end.format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                }
            }
            const db: DbInstance<ParseLogEntity> = getDb(TableName.ParseLog);
            yield put({ type: 'setLoading', payload: true });
            try {
                let data: ParseLogEntity[] = yield call([db, 'findByPage'], q, current, pageSize, 'endTime', -1);
                yield put({ type: 'setData', payload: data });
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
            const db: DbInstance<ParseLogEntity> = getDb(TableName.ParseLog);
            let time: Date | undefined;
            switch (payload) {
                case DelLogType.TwoYearsAgo:
                    time = new Date(moment().subtract(2, 'years').valueOf());
                    break;
                case DelLogType.OneYearAgo:
                    time = new Date(moment().subtract(1, 'years').valueOf());
                    break;
                case DelLogType.SixMonthsAgo:
                    time = new Date(moment().subtract(6, 'months').valueOf());
                    break;
            }
            try {
                yield call([db, 'remove'], {
                    endTime: { $lt: time }
                }, true);
                if (time === undefined) {
                    message.error('日志清理失败');
                    yield put({ type: 'setLoading', payload: false });
                } else {
                    message.success('日志清理成功');
                    yield put({ type: 'queryParseLog', payload: { condition: {}, current: 1, pageSize: 15 } });
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

            const db: DbInstance<ParseLogEntity> = getDb(TableName.ParseLog);

            try {
                yield call([db, 'remove'], { _id: payload });
                message.success('删除成功');
                yield put({
                    type: 'queryParseLog', payload: {
                        condition: null,
                        current: 1,
                        pageSize: 15
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

            const db: DbInstance<ParseLogEntity> = getDb(TableName.ParseLog);

            try {
                yield call([db, 'remove'], {}, true);
                message.success('日志清除成功');
                yield put({
                    type: 'queryParseLog', payload: {
                        condition: null,
                        current: 1,
                        pageSize: 15
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