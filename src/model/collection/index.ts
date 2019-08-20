import { IModel, IObject, IAction, IEffects } from "@type/model";
import Rpc from '@src/service/rpc';

const rpc = new Rpc();

//数据采集
let model: IModel = {
    namespace: "collection",
    state: {
        //测试数据
        data: null,
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
        setError(state: IObject, action: IAction) {
            return {
                ...state,
                error: action.payload
            }
        }
    },
    effects: {
        *invokeSum(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'add', [100.0, 200.0]);
            yield put({ type: "setTestData", payload: result });
        },
        *invokeHello(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'hello', [action.payload]);
            yield put({ type: "setTestData", payload: result });
        },
        *invokeJSON(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'getJSON');
            yield put({ type: "setTestData", payload: result });
        },
        *invokeRandom(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'Random');
            yield put({ type: "setTestData", payload: result });
        }
    },
    subscriptions: {
    }
};

export default model;