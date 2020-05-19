import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from "redux";
import moment from 'moment';
import CFetchLog from '@src/schema/CFetchLog';
import { DelLogType } from '@src/view/operation/components/DelLogModal/ComponentType';
import Db from '@utils/Db';
import { helper } from '@src/utils/helper';
import logger from '@src/utils/log';
import { message } from 'antd';

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
    /**
     * 当前编辑的数据
     */
    editEntity?: CFetchLog;
}

/**
 * 编辑采集日志仓库模型
 */
let model: Model = {
    namespace: 'fetchLogEdit',
    state: {
        data: [],
        total: 0,
        current: 1,
        pageSize: 15,
        loading: false,
        editEntity: null
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
        },
        setEditEntity(state: any, { payload }: AnyAction) {
            return { ...state, editEntity: payload };
        }
    },
    effects: {
        /**
         * 查询全部采集日志数据
         */
        *queryAllFetchLog({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
            const db = new Db<CFetchLog>('FetchLog');
            const { condition, current, pageSize } = payload;
            let $condition: any = null;
            if (Db.isEmptyCondition(condition)) {
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
            yield put({ type: 'setLoading', payload: true });
            try {
                let [data, total]: [CFetchLog[], number] = yield all([
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
        },
        /**
         * 修改日志时间
         */
        *modifyTime({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<CFetchLog>('FetchLog');
            yield put({ type: 'setLoading', payload: true });
            try {
                let result: CFetchLog = yield call([db, 'findOne'], { _id: payload.id });
                result.m_strStartTime = payload.startTime.format('YYYY-MM-DD HH:mm:ss');
                result.m_strFinishTime = payload.endTime.format('YYYY-MM-DD HH:mm:ss');
                yield call([db, 'update'], { _id: payload.id }, result);
                yield put({
                    type: 'queryAllFetchLog', payload: {
                        condition: null,
                        current: 1,
                        pageSize: 15
                    }
                });
                message.success('编辑成功');
            } catch (error) {
                console.log(error);
                message.error('编辑失败');
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { StoreData };
export default model;
