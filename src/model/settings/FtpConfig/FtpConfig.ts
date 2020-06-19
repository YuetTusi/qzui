import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import message from 'antd/lib/message';
import Db from '@utils/db';
import logger from '@src/utils/log';
import { helper } from '@src/utils/helper';
import { BaseEntity } from '@src/type/model';

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
}

let model: Model = {
    namespace: 'ftpConfig',
    state: {
        ip: '',
        port: 21,
        username: '',
        password: ''
    },
    reducers: {
        setConfig(state: any, { payload }: AnyAction) {
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
        *queryConfig({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db('FtpConfig');
            try {
                let ftpCfg: FtpStoreState = yield call([db, 'findOne'], null);
                if (!helper.isNullOrUndefined(ftpCfg)) {
                    yield put({
                        type: 'setConfig', payload: {
                            ip: ftpCfg.ip,
                            port: ftpCfg.port,
                            username: ftpCfg.username,
                            password: ftpCfg.password
                        }
                    });
                } else {
                    yield put({
                        type: 'setConfig', payload: {
                            ip: '',
                            port: 21,
                            username: '',
                            password: ''
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
                        password: payload.password
                    });
                } else {
                    yield call([db, 'update'], { _id: ftpCfg._id }, {
                        ip: payload.ip,
                        port: payload.port,
                        username: payload.username,
                        password: payload.password
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