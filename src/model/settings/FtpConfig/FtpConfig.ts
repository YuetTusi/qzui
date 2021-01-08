import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import message from 'antd/lib/message';
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

            try {
                const exist: boolean = yield call([helper, 'existFile'], payload);
                if (exist) {
                    let ftp = yield call([helper, 'readJSONFile'], payload);
                    yield put({
                        type: 'setConfig', payload: {
                            ip: ftp.ip,
                            port: ftp.port,
                            username: ftp.username,
                            password: ftp.password,
                            serverPath: ftp.serverPath
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
         * @param {string} payload.savePath JSON存储位置
         * @param {object} payload.data FTP数据
         */
        *saveConfig({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            const { data, savePath } = payload;
            // debugger;
            try {
                yield call([helper, 'writeJSONfile'], savePath, data);
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