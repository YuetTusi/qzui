import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import Db from '@utils/Db';
import { TableName } from '@src/schema/db/TableName';
import { UIRetOneParseLogInfo } from '@src/schema/UIRetOneParseLogInfo';
import { helper } from '@src/utils/helper';
import { DelLogType } from '@src/view/operation/components/DelLogModal/ComponentType';
import moment from 'moment';
import message from 'antd/lib/message';
import logger from '@src/utils/log';

interface StoreData {
    /**
     * 加载中
     */
    loading: boolean;
    /**
     * 表格数据
     */
    data: UIRetOneParseLogInfo[];
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
                        llParseEnd_: {
                            ...q?.llParseEnd_,
                            $gte: condition?.start.format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                }
                if (!helper.isNullOrUndefined(condition?.end)) {
                    q = {
                        llParseEnd_: {
                            ...q?.llParseEnd_,
                            $lte: condition?.end.format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                }
            }
            const db = new Db<UIRetOneParseLogInfo>(TableName.ParseLog);
            yield put({ type: 'setLoading', payload: true });
            try {
                let data: UIRetOneParseLogInfo[] = yield call([db, 'findByPage'], q, current, pageSize, 'llParseEnd_', -1);
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
            const db = new Db<UIRetOneParseLogInfo>(TableName.ParseLog);
            let time: string = '';
            switch (payload) {
                case DelLogType.TwoYearsAgo:
                    time = moment().subtract(2, 'years').format('YYYY-MM-DD HH:mm:ss');
                    break;
                case DelLogType.OneYearAgo:
                    time = moment().subtract(1, 'years').format('YYYY-MM-DD HH:mm:ss');
                    break;
                case DelLogType.SixMonthsAgo:
                    time = moment().subtract(6, 'months').format('YYYY-MM-DD HH:mm:ss');
                    break;
            }
            try {
                yield call([db, 'remove'], {
                    llParseEnd_: { $lt: time }
                }, true);
                if (time === '') {
                    message.success('日志清理失败');
                    yield put({ type: 'setLoading', payload: false });
                } else {
                    message.success('日志清理成功');
                    yield put({ type: 'queryParseLog', payload: { condition: {}, current: 1, pageSize: 15 } });
                }
            } catch (error) {
                message.success('日志清理失败');
                logger.error(`日志删除失败 @modal/operation/ParseLog.ts/deleteParseLogByTime: ${error.message}`);
            }
        }
    }
};

export { StoreData };
export default model;