import { IObject, IAction, IModel } from '@src/type/model';

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
        // *syncAdd(action: IAction, effect: any) {
        //     const { call, put } = effect;
        //     yield call();
        // }
    }
};

export default model;