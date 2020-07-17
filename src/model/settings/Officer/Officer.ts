import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import message from 'antd/lib/message';
import { Officer } from '@src/schema/Officer';
import { TableName } from '@src/schema/db/TableName';
import Db from '@utils/db';

/**
 * 仓库数据
 */
interface StoreData {
    data: Officer[];
}

let model: Model = {
    namespace: 'officer',
    state: {
        data: []
    },
    reducers: {
        setOfficer(state: any, { payload }: AnyAction) {
            state.data = payload;
            return state;
        }
    },
    effects: {
        /**
         * 查询全部检验员
         */
        *fetchOfficer({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<Officer>(TableName.Officer);
            try {
                let result: any[] = yield call([db, 'find'], null);
                yield put({ type: 'setOfficer', payload: [...result] });
            } catch (error) {
                console.error(`@model/Officer.ts/fetchOfficer`);
            }
        },
        /**
         * 删除检验员（删除时除ID外其它属性置空，即为删除）
         */
        *delOfficer({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<Officer>(TableName.Officer);
            try {
                yield call([db, 'remove'], { _id: payload });
                yield put({ type: 'fetchOfficer' });
                message.success('删除成功');
            } catch (error) {
                console.info(`@model/Officer.ts/fetchOfficer: ${error.message}`);
                message.success('删除失败');
            }
        }
    }
};

export { StoreData };
export default model;