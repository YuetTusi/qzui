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
        *invokeHello(action: IAction, { put, call }: IEffects) {
            let result = yield call([rpc, 'invoke'], 'hello', ['Jack']);
            console.log(result);

            // yield put({ type: "setTestData", payload: result });
        }
    },
    subscriptions: {
        getTcpMessage() {
            // rpc.subscribe('test','111');
        }
    }
};

export default model;