import path from 'path';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import logger from '@src/utils/log';
import { helper } from '@src/utils/helper';

const appRootPath = process.cwd();
let ftpJsonPath = appRootPath; //FTP_JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
    ftpJsonPath = path.join(appRootPath, 'data/ftp.json');
} else {
    ftpJsonPath = path.join(appRootPath, 'resources/data/ftp.json');
}

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

            try {
                const exist: boolean = yield call([helper, 'existFile'], ftpJsonPath);
                if (exist) {
                    let ftp: Record<string, any> = yield call([helper, 'readJSONFile'], ftpJsonPath);
                    yield put({ type: 'setFtpConfig', payload: ftp });
                } else {
                    yield put({
                        type: 'setFtpConfig', payload: {
                            ip: '',
                            port: 21,
                            username: '',
                            password: ''
                        }
                    });
                }
            } catch (error) {
                logger.error({ message: `查询失败:@model/tools/Menu/queryFtpCofnig, 错误消息: ${error.message}` });
            }
        }
    }
};

export { MenuStoreState };
export default model;