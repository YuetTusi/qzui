import IModel, { IObject, IAction, IEffects } from "@src/type/model";
import { CCoronerInfo } from '@src/schema/CCoronerInfo';
import Rpc from '@src/service/rpc';
import { message } from "antd";
import { routerRedux } from 'dva/router';
const rpc = new Rpc();

let model: IModel = {
    namespace: 'officerEdit',
    state: {
        officerData: null
    },
    reducers: {
        // setOfficer(state: IObject, action: IAction) {
        //     return {
        //         ...state,
        //         officerData: [...action.payload]
        //     };
        // }
    },
    effects: {
        *saveOfficer(action: IAction, { call, put }: IEffects) {
            let entity = new CCoronerInfo({
                m_strCoronerName: action.payload.m_strCoronerName,
                m_strCoronerID: action.payload.m_strCoronerID
            });
            console.log(entity);
            try {
                yield call([rpc, 'invoke'], 'SaveCoronerInfo', [entity]);
                yield put(routerRedux.push('/settings/officer'));
                message.success('保存成功');
            } catch (error) {
                message.error('保存失败');
                console.error(`@model/OfficeEdit.ts/saveOfficer:${error.message}`);
            }

            // yield put({ type: 'setOfficer', payload: data.data });
        }
    }
};
export default model;