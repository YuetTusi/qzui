import { IModel, IObject, IAction } from "@type/model";
import { message } from 'antd';
const { Rpc } = window;
const client = new Rpc({ methods: ['getTestData'] });

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

            yield put({ type: 'setLoading', payload: true });
            try {
                let { data, code, error } = yield call([client, 'send'], 'getTestData', '参数1', '参数2', '参数3');
                if (code === 0) {
                    yield put({ type: 'setTestData', payload: data });
                } else {
                    yield put({ type: 'setError', payload: error });
                }
            } catch (e) {
                yield put({ type: 'setError', payload: e });
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    },
    subscriptions: {
        /**
         * @description 订阅RPC错误消息
         * @param param0 配置对象
         */
        rpcError({ dispatch }: IObject) {
            client.on('error', (name: string, err: Error) => {
                console.log(`远程方法调用失败 @model/collection/index.ts: ${err.message}`);
                message.error(`${name}远程方法调用失败`);
                dispatch({ type: 'setError', payload: err });
                dispatch({ type: 'setLoading', payload: false });
            });
        },
        /**
         * @description 订阅服务端推送
         */
        subMessage() {
            let unsubscribe = client.subscribe('test', (message: string) => {
                console.log(message);
            })
            setTimeout(() => {
                unsubscribe();
            }, 5000);
        }
    }
};

export default model;