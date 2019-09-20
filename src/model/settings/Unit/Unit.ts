import IModel, { IAction, IEffects, IObject } from "@src/type/model";
import { request } from '@utils/request';

let model: IModel = {
    namespace: 'unit',
    state: {
        unitData: null
    },
    reducers: {
        setUnitData(state: IObject, action: IAction) {
            return {
                ...state,
                unitData: [...action.payload]
            }
        }
    },
    effects: {
        *fetchUnitSelect(action: IAction, { call, put }: IEffects) {
            let { code, data } = yield call(request, {
                url: 'api/unit',
                method: 'GET'
            });
            yield put({ type: 'setUnitData', payload: data.data });
        }
    }
};

export default model;