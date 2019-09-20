import IModel, { IObject, IAction, IEffects } from "@src/type/model";
import { request } from "@src/utils/request";

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
            let { code, data } = yield call(request, { url: 'api/officer' });
            yield put({ type: 'setOfficer', payload: data.data });
        }
    }
};
export default model;