import { AnyAction } from 'redux';
import { EffectsCommandMap, Model } from 'dva';
import { send } from '@src/service/tcpServer';
import CommandType, { SocketType } from '@src/schema/socket/Command';

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
            state.message.unshift(payload);
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
        *queryDev({ payload }: AnyAction, { fork, put }: EffectsCommandMap) {
            yield put({ type: 'setDev', payload: [] });
            yield fork(send, SocketType.Fetch, {
                type: SocketType.Fetch,
                cmd: CommandType.CrackQuery
            });
        },
        /**
         * 破解设备
         * @param {string} payload.id 所选设备value
         * @param {CrackType} payload.type 方式
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
         * @param {string} payload.id 所选设备value
         * @param {CrackType} payload.type 方式
         */
        *startRecover({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork(send, SocketType.Fetch, {
                type: SocketType.Fetch,
                cmd: CommandType.StartRecover,
                msg: payload
            });
        },
        /**
         * 关闭破解弹框
         * 通知Fetch清理数据
         */
        *closeCrack({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork(send, SocketType.Fetch, {
                type: SocketType.Fetch,
                cmd: CommandType.CloseCrack,
                msg: ''
            });
        }
    }
    // subscriptions: {
    //     test({ dispatch }: SubscriptionAPI) {
    //         let i = 0;
    //         setInterval(() => {
    //             dispatch({ type: 'setMessage', payload: `测试消息_${i++}` });
    //             dispatch({ type: 'setDev', payload: [{ name: 'iPhone13', value: '1' }, { name: 'iPhone14', value: '2' }] });
    //         }, 3000);
    //     }
    // }
};

export { Dev, CrackModalStore };
export default model;