import { AnyAction } from 'redux';
import { EffectsCommandMap, Model, SubscriptionAPI } from 'dva';
import server, { send } from '@src/service/tcpServer';
import CommandType, { Command, SocketType } from '@src/schema/socket/Command';

interface Dev {
    /**
     * 
     */
    name: string,
    /**
     * 
     */
    value: string
}

interface CrackModalStore {

    dev: Dev[],
    message: string[]
}

/**
 * 设备破解弹框
 */
let model: Model = {
    namespace: 'crackModal',
    state: {
        dev: [],
        message: []
    },
    reducers: {
        /**
         * 设置设备列表 
         * @param {Dev[]} payload 设备列表
         */
        setDev(state: CrackModalStore, { payload }: AnyAction) {
            state.dev = payload;
            return state;
        },
        /**
         * 设置破解消息(追加)
         * @param {string} payload
         */
        setMessage(state: CrackModalStore, { payload }: AnyAction) {
            state.message.push(payload);
            return state;
        },
        /**
         * 清空消息
         */
        clearMessage(state: CrackModalStore) {
            state.message = [];
            return state;
        }
    },
    effects: {
        /**
         * 查询破解设备列表
         */
        *queryDev({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork(send, SocketType.Fetch, {
                type: SocketType.Fetch,
                cmd: CommandType.CrackQuery
            });
        },
        /**
         * 破解设备
         * @param {string} payload 所选设备value
         */
        *startCrack({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork(send, SocketType.Fetch, {
                type: SocketType.Fetch,
                cmd: CommandType.StartCrack,
                msg: payload
            });
        },
        /**
         * 恢复设备
         * @param {string} payload 所选设备value
         */
        *startRecover({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork(send, SocketType.Fetch, {
                type: SocketType.Fetch,
                cmd: CommandType.StartRecover,
                msg: payload
            });
        }
    }
    // subscriptions: {
    //     test({ dispatch }: SubscriptionAPI) {
    //         setTimeout(() => {
    //             dispatch({ type: 'setMessage', payload: '测试消息_234234234' });
    //             dispatch({ type: 'setDev', payload: [{ name: 'iPhone13', value: '1' }, { name: 'iPhone14', value: '2' }] });
    //         }, 3000);
    //     }
    // }
};

export { Dev, CrackModalStore };
export default model;