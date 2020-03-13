import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { fetcher } from '@src/service/rpc';

let model: Model = {
    namespace: 'officer',
    state: {
        officerData: []
    },
    reducers: {
        setOfficer(state: any, action: AnyAction) {
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
        *fetchOfficer(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([fetcher, 'invoke'], 'GetCheckerInfo', []);
                // let result = [{ m_strUUID: '1', m_strCoronerID: '123456', m_strCoronerName: 'Tom' }];
                yield put({ type: 'setOfficer', payload: [...result] });
            } catch (error) {
                console.error(`@model/Officer.ts/fetchOfficer`);
            }
        },
        /**
         * 删除检验员（删除时除ID外其它属性置空，即为删除）
         */
        *delOfficer(action: AnyAction, { call, put }: EffectsCommandMap) {
            let entity = new CCheckerInfo();
            entity.m_strUUID = action.payload;
            entity.m_strCheckerName = '';
            entity.m_strCheckerID = '';
            try {
                yield call([fetcher, 'invoke'], 'SaveCheckerInfo', [entity]);
                let result = yield call([fetcher, 'invoke'], 'GetCheckerInfo', []);
                yield put({ type: 'setOfficer', payload: [...result] });
            } catch (error) {
                console.info(`@model/Officer.ts/fetchOfficer: ${error.message}`);
            }
        }
    }
};
export default model;