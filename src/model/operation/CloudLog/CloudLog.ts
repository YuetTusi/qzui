import { AnyAction } from 'redux';
import { remote } from 'electron';
import { EffectsCommandMap, Model } from "dva";
import { CloudLog } from '@src/schema/socket/CloudLog';
import { helper } from '@src/utils/helper';
import { DbInstance } from '@src/type/model';
import { TableName } from '@src/schema/db/TableName';
import moment from 'moment';
import { CloudCodeModalStoreState, OneCloudApp } from '@src/model/components/CloudCodeModal';

const defaultPageSize = 10;
const Db = remote.getGlobal('Db');
const getDb = remote.getGlobal('getDb');

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
    apps: OneCloudApp[]
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

            const db: DbInstance<CloudLog> = getDb(TableName.CloudLog);
            yield put({ type: 'setLoading', payload: true });
            try {
                let [data, total]: [CloudLog[], number] = yield all([
                    call([db, 'findByPage'], $condition, current, pageSize, 'fetchTime', -1),
                    call([db, 'count'], $condition)
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
        }
    }
};

export { CloudLogStoreState };
export default model;