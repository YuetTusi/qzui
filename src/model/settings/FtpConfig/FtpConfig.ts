import { remote } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import message from 'antd/lib/message';
import logger from '@src/utils/log';
import { DbInstance } from '@type/model';
import { helper } from '@src/utils/helper';
import { BaseEntity } from '@src/type/model';

const Db = remote.getGlobal('Db');

interface FtpStoreState extends BaseEntity {
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
     * 上传位置
     */
    serverPath: string;
}


/**
 * FTP上传配置Model
 */
let model: Model = {
    namespace: 'ftpConfig',
    state: {
        ip: '',
        port: 21,
        username: '',
        password: '',
        serverPath: '/'
    },
    reducers: {
        setConfig(state: any, { payload }: AnyAction) {
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
        *queryConfig({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db: DbInstance<any> = new Db('FtpConfig');
            try {
                let ftpCfg: FtpStoreState = yield call([db, 'findOne'], null);
                if (!helper.isNullOrUndefined(ftpCfg)) {
                    yield put({
                        type: 'setConfig', payload: {
                            ip: ftpCfg.ip,
                            port: ftpCfg.port,
                            username: ftpCfg.username,
                            password: ftpCfg.password,
                            serverPath: ftpCfg.serverPath
                        }
                    });
                } else {
                    yield put({
                        type: 'setConfig', payload: {
                            ip: '',
                            port: 21,
                            username: '',
                            password: '',
                            serverPath: '/'
                        }
                    });
                }
            } catch (error) {
                logger.error(`查询FTP配置失败: @model/settings/FtpConfig/queryConfig, 消息:${error.message}`);
            }
        },
        /**
         * 保存FTP配置
         */
        *saveConfig({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db('FtpConfig');
            try {
                let ftpCfg: FtpStoreState = yield call([db, 'findOne'], null);
                if (helper.isNullOrUndefined(ftpCfg)) {
                    yield call([db, 'insert'], {
                        ip: payload.ip,
                        port: payload.port,
                        username: payload.username,
                        password: payload.password,
                        serverPath: payload.serverPath
                    });
                } else {
                    yield call([db, 'update'], { _id: ftpCfg._id }, {
                        ip: payload.ip,
                        port: payload.port,
                        username: payload.username,
                        password: payload.password,
                        serverPath: payload.serverPath
                    });
                }
                message.success('保存成功');
            } catch (error) {
                logger.error(`保存FTP配置失败: @model/settings/FtpConfig/saveConfig, 消息:${error.message}`);
                message.error('保存失败');
            }
        }
    }
};

export { FtpStoreState };
export default model;