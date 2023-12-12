import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { send } from '@src/service/tcpServer';
import CommandType, { SocketType } from '@src/schema/socket/Command';

export default {
    /**
     * 查询设备列表
     */
    *queryDev({ }: AnyAction, { fork, put }: EffectsCommandMap) {
        yield put({ type: 'setDev', payload: [] });
        yield fork(send, SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.AndroidAuthQuery
        });
    },
    /**
     * 提权
     * @param {string} payload.id 所选设备value
     */
    *pick({ payload }: AnyAction, { fork }: EffectsCommandMap) {
        console.log({
            type: SocketType.Fetch,
            cmd: CommandType.AndroidAuthPick,
            msg: payload
        });
        yield fork(send, SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.AndroidAuthPick,
            msg: payload
        });
    },
    /**
     * 解锁
     */
    *unlock({ payload }: AnyAction, { fork }: EffectsCommandMap) {
        console.log({
            type: SocketType.Fetch,
            cmd: CommandType.AndroidUnlock,
            msg: payload
        });
        yield fork(send, SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.AndroidUnlock,
            msg: payload
        });
    },
    /**
     * 关闭弹框
     * 通知Fetch清理数据
     */
    *closeAndroidAuth({ }: AnyAction, { fork }: EffectsCommandMap) {
        yield fork(send, SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.AndroidAuthClose,
            msg: ''
        });
    }
}