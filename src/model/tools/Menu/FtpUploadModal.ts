import { remote } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import logger from '@src/utils/log';
import { helper } from '@src/utils/helper';
import { DbInstance } from '@src/type/model';
import { TableName } from '@src/schema/db/TableName';

const getDb = remote.getGlobal('getDb');

interface FtpModalStoreState {
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
}

let model: Model = {
    namespace: 'ftpUploadModal',
    state: {
        ip: '',
        port: 21,
        username: '',
        password: ''
    },
    reducers: {
        setFtpConfig(state: any, { payload }: AnyAction) {
            return {
                ip: payload.ip,
                port: payload.port,
                username: payload.username,
                password: payload.password
            }
        }
    },
    effects: {
        /**
         * 查询FTP配置
         */
        *queryFtpConfig({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db: DbInstance<FtpModalStoreState> = getDb(TableName.FtpConfig);
            try {
                let cfg: FtpModalStoreState = yield call([db, 'findOne'], null);
                if (!helper.isNullOrUndefined(cfg)) {
                    yield put({ type: 'setFtpConfig', payload: cfg });
                }
            } catch (error) {
                logger.error({ message: `查询失败:@model/tools/Menu/FtpUploadModal/queryFtpCofnig, 错误消息: ${error.message}` });
            }
        }
    }
};

export { FtpModalStoreState };
export default model;