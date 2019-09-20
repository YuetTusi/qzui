import IModel, { IObject, IAction, IEffects } from "@src/type/model";
import { request } from '@src/utils/request';

let model: IModel = {
    namespace: 'case',
    state: {
        //案件表格数据
        caseData: null
    },
    reducers: {
        setCaseData(state: IObject, action: IAction) {
            return {
                ...state,
                caseData: [...action.payload]
            }
        }
    },
    effects: {
        *fetchCaseData(action: IAction, { call, put }: IEffects) {
            let { code, data: { data } } = yield call(request, {
                method: "GET",
                url: 'api/case'
            });
            if (code === 0) {
                yield put({ type: 'setCaseData', payload: data });
            }
        }
    }
};

export default model;