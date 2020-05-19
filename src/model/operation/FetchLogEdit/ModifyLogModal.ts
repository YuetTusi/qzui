import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import CFetchLog from '@src/schema/CFetchLog';
import Db from '@src/utils/Db';

interface StoreData {
    /**
     * 编辑的日志对象
     */
    entity: CFetchLog;
}

let model: Model = {
    namespace: 'modifyLogModal',
    state: {
        setEntity(state: any, { payload }: AnyAction) {
            console.log(payload);
            return { ...state, entity: payload };
        }
    },
    effects: {
        /**
         * 按id查询
         */
        *queryById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<CFetchLog>('FetchLog');
            try {
                let result = yield call([db, 'findOne'], { _id: payload });
                console.log(result);
                yield put({ type: 'setEntity', payload: result });
            } catch (error) {
                console.log(error);
            }
        },
    }
};

export { StoreData };
export default model;