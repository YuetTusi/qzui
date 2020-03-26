import { Model, EffectsCommandMap } from 'dva';
import moment from 'moment';
import { AnyAction } from "redux";
import CFetchLog from '@src/schema/CFetchLog';
import Db from '@utils/Db';

interface StoreData {
    /**
     * 表格数据
     */
    data: CFetchLog[];
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
        loading: false
    },
    reducers: {
        setData(state: any, { payload }: AnyAction) {
            return {
                ...state,
                data: [...payload]
            };
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
            yield put({ type: 'setLoading', payload: true });
            try {
                let data: CFetchLog[] = yield call([db, 'getAll']);
                //按完成时间倒序
                data.sort((a, b) => {
                    return moment(a.m_strFinishTime).isAfter(moment(b.m_strFinishTime)) ? -1 : 1;
                });
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
};

export { StoreData };
export default model;
