import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import message from 'antd/lib/message';
import { fetcher } from '@src/service/rpc';

let model: Model = {
    namespace: 'casePath',
    state: {
        path: ''
    },
    reducers: {
        setPath(state: any, { payload }: AnyAction) {
            return { path: payload };
        }
    },
    effects: {
        /**
         * 查询案件存储路径
         */
        *queryCasePath(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([fetcher, 'invoke'], 'GetDataSavePath');
                yield put({ type: 'setPath', payload: result });
            } catch (error) {
                console.error(`@model/CasePath.ts/GetDataSavePath:${error.message}`);
            }
        },
        /**
         * 保存案件存储路径
         */
        *saveCasePath(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                yield call([fetcher, 'invoke'], 'SaveDataSavePath', [action.payload]);
                message.success('保存成功');
            } catch (error) {
                message.error('保存失败');
                console.error(`@model/CasePath.ts/saveCasePath:${error.message}`);
            }
        }
    }
};

export default model;