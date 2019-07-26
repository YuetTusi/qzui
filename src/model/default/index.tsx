import { IObject, IAction, IModel } from '@src/type/model';
import { request } from '@src/utils/request';

let model: IModel = {
    namespace: 'default',
    state: { num: 0 },
    reducers: {
        add(state: IObject, action: IAction) {
            return {
                ...state,
                num: state.num + action.payload
            }
        },
        minus(state: IObject, action: IAction) {
            return {
                ...state,
                num: state.num - action.payload
            }
        }
    },
    effects: {
        *syncAdd(action: IAction, effect: any) {
            const { call, put } = effect;
            let { code, data } = yield call(request, {
                url: 'api/test',
                method: 'GET'
            });
            yield put({ type: "add", payload: data.num });
        },
        *syncMinus(action: IAction, effect: any) {
            const { call, put } = effect;
            let { code, data } = yield call(request, {
                url: 'api/test',
                method: 'GET'
            });
            yield put({ type: "minus", payload: data.num });
        }
    }
};

export default model;