import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import logger from '@utils/log';
import { helper } from '@utils/helper';
import { send } from '@src/service/tcpServer';
import { TableName } from '@src/schema/db/TableName';
import CommandType, { SocketType } from '@src/schema/socket/Command';

const { Trace } = SocketType;

export default {
    /**
     * 读取用户记录并发送登录命令
     */
    *loadUserToLogin({ }: AnyAction, { call, put }: EffectsCommandMap) {

        try {
            const user: any[] = yield call([ipcRenderer, 'invoke'], 'db-find', TableName.TraceUser, null);
            if (user.length > 0) {
                let { username, password } = user[0];
                logger.info(`登录查询账户, 用户:${username}`);
                yield put({ type: 'setUser', payload: { username, password } });
                yield call(send, Trace, {
                    type: Trace,
                    cmd: CommandType.TraceLogin,
                    msg: {
                        username,
                        password: helper.base64ToString(password)
                    }
                });
            }
        } catch (error) {
            logger.error(`@model/TraceLogin/effects/loadUserToLogin: ${error.message}`);
        }
    },
    /**
     * 查询登录用户
     */
    *queryUser({ }: AnyAction, { call, put }: EffectsCommandMap) {
        try {
            const user: any[] = yield call([ipcRenderer, 'invoke'], 'db-find', TableName.TraceUser, null);
            if (user.length > 0) {
                let { username, password } = user[0];
                yield put({ type: 'setUser', payload: { username, password } });
            }
        } catch (error) {
            logger.error(`@model/TraceLogin/effects/queryUser: ${error.message}`);
        }
    },
    /**
     * 保存用户
     */
    *saveUser({ payload }: AnyAction, { call }: EffectsCommandMap) {
        try {
            yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.TraceUser,
                {}, true);
            yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.TraceUser,
                payload);
        } catch (error) {
            logger.error(`@model/TraceLogin/effects/saveUser: ${error.message}`);
        }
    },
    /**
     * 删除登录用户记录
     */
    *delUser({ }: AnyAction, { fork }: EffectsCommandMap) {
        try {
            yield fork([ipcRenderer, 'invoke'], 'db-remove', TableName.TraceUser, {}, true);
        } catch (error) {
            logger.error(`@model/TraceLogin/effects/delUser: ${error.message}`);
        }
    },
};