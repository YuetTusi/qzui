import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import Db from '@utils/Db';
import { UIRetOneParseLogInfo } from '@src/schema/UIRetOneParseLogInfo';
import { helper } from '@src/utils/helper';

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
            const db = new Db<UIRetOneParseLogInfo>('ParseLog');
            yield put({ type: 'setLoading', payload: true });
            try {
                let data: UIRetOneParseLogInfo[] = yield call([db, 'findByPage'], q, current, pageSize, 'llParseEnd_', -1);
                console.log(q, current, pageSize);
                yield put({ type: 'setData', payload: data });
            } catch (error) {
                console.log(error);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { StoreData };
export default model;