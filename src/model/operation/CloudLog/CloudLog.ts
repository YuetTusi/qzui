import { AnyAction } from 'redux';
import { ipcRenderer } from 'electron';
import { EffectsCommandMap, Model } from "dva";
import moment from 'moment';
import message from 'antd/lib/message';
import logger from '@utils/log';
import { CloudLog } from '@src/schema/socket/CloudLog';
import { helper } from '@src/utils/helper';
import { TableName } from '@src/schema/db/TableName';
import { DelLogType } from '@src/view/operation/components/DelLogModal/ComponentType';
import { CloudAppMessages } from '@src/schema/socket/CloudAppMessages';
import Db from '@src/utils/db';

const defaultPageSize = 10;
// const Db = remote.getGlobal('Db');
// const getDb = remote.getGlobal('getDb');

interface CloudLogStoreState {
    /**
     * 读取中
     */
    loading: boolean,
    /**
     * 表格数据
     */
    data: CloudLog[],
    /**
     * 总记录数
     */
    total: number,
    /**
     * 当前页
     */
    current: number,
    /**
     * 页尺寸
     */
    pageSize: number,
    /**
     * 显示详情框
     */
    detailVisible: boolean,
    /**
     * 当前显示详情的应用
     */
    apps: CloudAppMessages[]
}

/**
 * 云取证日志
 */
let model: Model = {
    namespace: 'cloudLog',
    state: {
        loading: false,
        total: 0,
        current: 1,
        pageSize: defaultPageSize,
        detailVisible: false,
        apps: []
    },
    reducers: {
        setLoading(state: CloudLogStoreState, { payload }: AnyAction) {
            state.loading = payload;
            return state;
        },
        setData(state: CloudLogStoreState, { payload }: AnyAction) {
            state.data = payload;
            return state;
        },
        setPage(state: CloudLogStoreState, { payload }: AnyAction) {
            state.current = payload.current;
            state.pageSize = payload.pageSize;
            state.total = payload.total;
            return state;
        },
        setDetailVisible(state: CloudLogStoreState, { payload }: AnyAction) {
            state.detailVisible = payload;
            return state;
        },
        setApps(state: CloudLogStoreState, { payload }: AnyAction) {
            state.apps = payload;
            return state;
        }
    },
    effects: {
        /**
         * 查询云取日志
         */
        *queryCloudLog({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
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
                            $gte: moment(condition.start, 'YYYY-MM-DD HH:mm:ss').toDate()
                        }
                    };
                }
                if (!helper.isNullOrUndefined(condition?.end)) {
                    $condition = {
                        fetchTime: {
                            ...$condition.fetchTime,
                            $lte: moment(condition.end, 'YYYY-MM-DD HH:mm:ss').toDate()
                        }
                    };
                }
            }

            yield put({ type: 'setLoading', payload: true });
            try {
                let [data, total]: [CloudLog[], number] = yield all([
                    call([ipcRenderer, 'invoke'], 'db-find-by-page', TableName.CloudLog, $condition, current, pageSize, 'fetchTime', -1),
                    call([ipcRenderer, 'invoke'], 'db-count', TableName.CloudLog, $condition)
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
        *deleteCloudLogByTime({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
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
                if (time !== undefined) {
                    yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.CloudLog, {
                        fetchTime: {
                            $lt: time
                        }
                    }, true);
                    message.success('日志清理成功');
                } else {
                    message.error('日志清理失败');
                }
                yield put({ type: 'queryCloudLog', payload: { condition: {}, current: 1, pageSize: defaultPageSize } });
            } catch (error) {
                message.error('日志清理失败');
                yield put({ type: 'setLoading', payload: false });
                logger.error(`日志删除失败 @modal/operation/CloudLog.ts/deleteCloudLogByTime: ${error.message}`);
            }
        },
        /**
         * 删除全部
         */
        *dropAllData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setLoading', payload: true });
            try {
                yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.CloudLog, {}, true);
                yield put({ type: 'queryCloudLog', payload: { condition: {}, current: 1, pageSize: defaultPageSize } });
                message.success('日志清除成功');
            } catch (error) {
                message.error('日志清除失败');
                logger.error(`日志清除失败 @modal/operation/CloudLog.ts/dropAllData: ${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 删除id的记录
         * @param {string} paylod 主键id
         */
        *dropById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setLoading', payload: true });
            try {
                yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.CloudLog, { _id: payload });
                yield put({ type: 'queryCloudLog', payload: { condition: {}, current: 1, pageSize: defaultPageSize } });
                message.success('日志删除成功');
            } catch (error) {
                message.error('日志删除失败');
                logger.error(`日志删除失败 @modal/operation/CloudLog.ts/dropById: ${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
    }
};

export { CloudLogStoreState };
export default model;