import Rpc from '@src/service/rpc';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';

const rpc = new Rpc();
//数据采集
let model: Model = {
    namespace: "collection",
    state: {
        //测试数据
        data: null,
        error: null,
        loading: false
    },
    reducers: {
        setTestData(state: any, action: AnyAction) {
            return {
                ...state,
                data: action.payload
            }
        },
        setError(state: any, action: AnyAction) {
            return {
                ...state,
                error: action.payload
            }
        }
    },
    effects: {
        *invokeHello(action: AnyAction, { put, call }: EffectsCommandMap) {
            let result = yield call([rpc, 'invoke'], 'hello', ['Jack']);
            console.log(result);
        }
    },
    subscriptions: {}
};

export default model;