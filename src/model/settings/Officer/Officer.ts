import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import message from 'antd/lib/message';
import { Officer } from '@src/schema/Officer';
import { TableName } from '@src/schema/db/TableName';

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
        /**
         * 更新检验员列表
         * @param {Officer[]} payload 检验员列表
         */
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
            try {
                let result: any[] = yield call([ipcRenderer, 'invoke'], 'db-find', TableName.Officer, null);
                yield put({ type: 'setOfficer', payload: [...result] });
            } catch (error) {
                console.error(`@model/Officer.ts/fetchOfficer: ${error.message}`);
            }
        },
        /**
         * 删除检验员
         * @param {string} payload 检验员ID
         */
        *delOfficer({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.Officer, { _id: payload });
                yield put({ type: 'fetchOfficer' });
                message.success('删除成功');
            } catch (error) {
                console.info(`@model/Officer.ts/delOfficer: ${error.message}`);
                message.success('删除失败');
            }
        }
    }
};

export { StoreData };
export default model;