import IModel, { IAction, IEffects, IObject } from "@src/type/model";
import { message } from 'antd';
import Rpc from '@src/service/rpc';

const rpc = new Rpc();

let model: IModel = {
    namespace: 'casePath',
    state: {
        path: ''
    },
    reducers: {
        setPath(state: IObject, { payload }: IAction) {
            return { path: payload };
        }
    },
    effects: {
        /**
         * 查询案件存储路径
         */
        *queryCasePath(action: IAction, { call, put }: IEffects) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetDataSavePath');
                console.log(result);
                yield put({ type: 'setPath', payload: result });
            } catch (error) {
                message.error('查询存储路径失败');
                console.error(`@model/CasePath.ts/GetDataSavePath:${error.message}`);
            }
        },
        /**
         * 保存案件存储路径
         */
        *saveCasePath(action: IAction, { call }: IEffects) {
            try {
                yield call([rpc, 'invoke'], 'SaveDataSavePath', [action.payload]);
                message.success('保存成功');
            } catch (error) {
                message.error('保存失败');
                console.error(`@model/CasePath.ts/saveCasePath:${error.message}`);
            }
        }
    }
};

export default model;