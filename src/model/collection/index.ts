import { IModel, IObject, IAction, IEffects } from "@type/model";
import Rpc from '@src/service/rpc';

const rpc = new Rpc();

//数据采集
let model: IModel = {
    namespace: "collection",
    state: {
        //测试数据
        data: null,
        result: 0,
        rnd: 0,
        error: null,
        loading: false
    },
    reducers: {
        setTestData(state: IObject, action: IAction) {
            return {
                ...state,
                data: action.payload
            }
        },
        setResult(state: IObject, action: IAction) {
            return {
                ...state,
                result: action.payload
            }
        },
        setRnd(state: IObject, action: IAction) {
            return {
                ...state,
                rnd: action.payload
            }
        },
        setError(state: IObject, action: IAction) {
            return {
                ...state,
                error: action.payload
            }
        }
    },
    effects: {
        *invokeHello(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'hello', [action.payload]);
            yield put({ type: "setTestData", payload: result });
        },
        *invokeAdd(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'add', [action.payload.n1, action.payload.n2]);
            yield put({ type: "setResult", payload: result });
        },
        *invokeRnd(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'rnd');
            yield put({ type: "setRnd", payload: result });
        }
    },
    subscriptions: {
    }
};

export default model;