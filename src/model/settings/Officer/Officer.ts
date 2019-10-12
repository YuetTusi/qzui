import IModel, { IObject, IAction, IEffects } from "@src/type/model";
import { message } from 'antd';
import Rpc from '@src/service/rpc';

const rpc = new Rpc();

let model: IModel = {
    namespace: 'officer',
    state: {
        officerData: null
    },
    reducers: {
        setOfficer(state: IObject, action: IAction) {
            return {
                ...state,
                officerData: [...action.payload]
            };
        }
    },
    effects: {
        *fetchOfficer(action: IAction, { call, put }: IEffects) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetCoronerInfo', []);
                yield put({ type: 'setOfficer', payload: result });
            } catch (error) {
                message.error('查询检验员数据失败');
                console.error(`@model/Officer.ts/fetchOfficer`);
            }
        }
    }
};
export default model;