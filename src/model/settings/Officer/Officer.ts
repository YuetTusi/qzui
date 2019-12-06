import IModel, { IObject, IAction, IEffects } from "@src/type/model";
import { message } from 'antd';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import Rpc from '@src/service/rpc';

const rpc = new Rpc();

let model: IModel = {
    namespace: 'officer',
    state: {
        officerData: []
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
        /**
         * 查询全部检验员
         */
        *fetchOfficer(action: IAction, { call, put }: IEffects) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetCheckerInfo', []);
                // let result = [{ m_strUUID: '1', m_strCoronerID: '123456', m_strCoronerName: 'Tom' }];
                yield put({ type: 'setOfficer', payload: [...result] });
            } catch (error) {
                message.error('查询检验员数据失败');
                console.error(`@model/Officer.ts/fetchOfficer`);
            }
        },
        /**
         * 删除检验员（删除时除ID外其它属性置空，即为删除）
         */
        *delOfficer(action: IAction, { call, put }: IEffects) {
            let entity = new CCheckerInfo();
            entity.m_strUUID = action.payload;
            entity.m_strCheckerName = '';
            entity.m_strCheckerID = '';
            try {
                yield call([rpc, 'invoke'], 'SaveCheckerInfo', [entity]);
                let result = yield call([rpc, 'invoke'], 'GetCheckerInfo', []);
                yield put({ type: 'setOfficer', payload: [...result] });
            } catch (error) {
                message.error('查询检验员数据失败');
                console.info(`@model/Officer.ts/fetchOfficer: ${error.message}`);
            }
        }
    }
};
export default model;