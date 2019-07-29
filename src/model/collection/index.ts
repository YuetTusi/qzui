import { IModel, IObject, IAction } from "@type/model";
let Rpc = window.Rpc;

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
        },
        setLoading(state: IObject, action: IAction) {
            return {
                ...state,
                loading: action.payload
            }
        }
    },
    effects: {
        *fetchTestData(action: IAction, effects: any) {
            const { call, put } = effects;
            const client = new Rpc({ methods: ['getTestData'] });
            yield put({ type: 'setLoading', payload: true });
            let { data, code, error } = yield call([client, 'send'], 'getTestData', '参数1', '参数2', '参数3');
            if (code === 0) {
                yield put({ type: 'setTestData', payload: data });
            } else {
                yield put({ type: 'setError', payload: error });
            }
            yield put({ type: 'setLoading', payload: false });
        }
    }
};

export default model;