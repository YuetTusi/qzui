import { IModel, IObject, IAction } from '@type/model';
const { Rpc } = window;

let model: IModel = {
    namespace: 'user',
    state: {
        data: [],
        error: null
    },
    reducers: {
        setData(state: IObject, action: IAction) {
            return {
                ...state,
                data: [
                    ...action.payload
                ]
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
        *getUser(action: IAction, effects: any) {
            const { call, put } = effects;
            try {
                let client = new Rpc({
                    uri: 'http://127.0.0.1:3000',
                    methods: [
                        'getUser'
                    ]
                });
                //调用对象方法时，要修正上下文
                let data = yield call([client, 'send'], 'getUser', '111', '222', 333);
                yield put({ type: 'setData', payload: data });
            } catch (err) {
                yield put({ type: 'setError', payload: err });
            }
        }
    }
};

export default model;