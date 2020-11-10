import { remote } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import logger from '@src/utils/log';
import { helper } from '@src/utils/helper';
import { DbInstance } from '@src/type/model';

const Db = remote.getGlobal('Db');

interface MenuStoreState {
    /**
     * FTP服务器IP
     */
    ip: string;
    /**
     * 端口号
     */
    port: number;
    /**
     * 用户名
     */
    username: string;
    /**
     * 密码
     */
    password: string;
    /**
     * 上传路径
     */
    serverPath: string;
}

let model: Model = {
    namespace: 'menu',
    state: {
        ip: '',
        port: 21,
        username: '',
        password: '',
        serverPath: '\\'
    },
    reducers: {
        setFtpConfig(state: any, { payload }: AnyAction) {
            if (helper.isNullOrUndefined(payload.serverPath)) {
                payload.serverPath = '\\';
            } else if (helper.isString(payload.serverPath) && !(payload.serverPath as string).startsWith('\\')) {
                payload.serverPath = `\\${payload.serverPath}`;
            }
            return {
                ip: payload.ip,
                port: payload.port,
                username: payload.username,
                password: payload.password,
                serverPath: payload.serverPath
            }
        }
    },
    effects: {
        /**
         * 查询FTP配置
         */
        *queryFtpConfig({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db: DbInstance<MenuStoreState> = new Db('FtpConfig');
            try {
                let cfg: MenuStoreState = yield call([db, 'findOne'], null);
                if (!helper.isNullOrUndefined(cfg)) {
                    yield put({ type: 'setFtpConfig', payload: cfg });
                } else {
                    yield put({
                        type: 'setFtpConfig', payload: {
                            ip: '',
                            port: 21,
                            username: '',
                            password: ''
                        }
                    })
                }
            } catch (error) {
                logger.error({ message: `查询失败:@model/tools/Menu/queryFtpCofnig, 错误消息: ${error.message}` });
            }
        }
    }
};

export { MenuStoreState };
export default model;