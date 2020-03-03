import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { rpc } from '@src/service/rpc';
import { message } from "antd";
import { routerRedux } from 'dva/router';

/**
 * 新增/编辑检验员Model
 */
let model: Model = {
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
        *saveOfficer(action: AnyAction, { call, put }: EffectsCommandMap) {
            let entity = new CCheckerInfo({
                m_strCheckerName: action.payload.m_strCheckerName,
                m_strCheckerID: action.payload.m_strCheckerID,
                m_strUUID: action.payload.m_strUUID
            });
            // console.log(action.payload);
            try {
                yield call([rpc, 'invoke'], 'SaveCheckerInfo', [entity]);
                yield put(routerRedux.push('/settings/officer'));
                message.success('保存成功');
            } catch (error) {
                message.error('保存失败');
                console.error(`@model/OfficeEdit.ts/saveOfficer:${error.message}`);
            }
        }
    }
};
export default model;