// import { AnyAction } from 'redux';
import { Model, SubscriptionAPI } from 'dva';
import { fetcher, parser } from '@src/service/rpc';
import { fetchReverseMethods, parseReverseMethods } from '@src/service/reverse';

let model: Model = {
    namespace: 'dashboard',
    state: {},
    subscriptions: {
        publishReverseMethods({ dispatch }: SubscriptionAPI) {
            fetcher.provide(fetchReverseMethods(dispatch), 'fetch');
            parser.provide(parseReverseMethods(dispatch), 'parse');
        }
    }
}

export default model;