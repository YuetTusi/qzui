import { AnyAction } from 'redux';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import Modal from 'antd/lib/modal';
import { TableName } from '@src/schema/db/TableName';
import { ParseState } from '@src/schema/socket/DeviceState';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import Db from '@src/utils/db';
import logger from '@src/utils/log';

const config = helper.readConf();

interface StoreData { }

/**
 * 首个加载的Model
 * #在此统一处理应用全局性操作
 */
let model: Model = {
    namespace: 'dashboard',
    state: {
        caseFromPlatform: null
    },
    effects: {
        *fetchingAndParsingState({ payload }: AnyAction, { select }: EffectsCommandMap) {
            let question = `确认退出${config.title}？`;
            Modal.destroyAll();
            Modal.confirm({
                title: '退出',
                content: question,
                okText: '是',
                cancelText: '否',
                onOk() {
                    localStorage.removeItem('CASE_DATA');
                    ipcRenderer.send('do-close', true);
                }
            });
        },
        /**
         * 将案件下所有设备为`解析中`和`采集中`更新为新状态
         * @param {ParseState} payload 解析状态
         */
        *updateAllDeviceParseState({ payload }: AnyAction, { call, fork }: EffectsCommandMap) {
            const db = new Db<DeviceType>(TableName.Device);
            try {
                let data: DeviceType[] = yield call([db, 'all']);
                let updateId: string[] = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i].parseState === ParseState.Fetching || data[i].parseState === ParseState.Parsing) {
                        updateId.push(data[i]._id!);
                    }
                }
                if (updateId.length > 0) {
                    yield fork([db, 'update'], { _id: { $in: updateId } }, { $set: { parseState: payload } }, true);
                }
            } catch (error) {
                logger.error(`启动应用更新解析状态失败 @modal/dashboard/index.ts/updateAllDeviceParseState: ${error.message}`);
            }
        }
    },
    subscriptions: {
        /**
         * 退出应用
         */
        exitApp({ dispatch }: SubscriptionAPI) {
            ipcRenderer.on('will-close', (event: IpcRendererEvent) => {
                dispatch({ type: 'fetchingAndParsingState' });
            });
        },
        /**
         * 更新所有设备为`解析中`的记录
         */
        initAllDeviceParseState({ dispatch }: SubscriptionAPI) {
            //NOTE: 当设备还有正在解析或采集时关闭了应用，下一次启动
            //NOTE: UI时要把所有为`解析中`和`采集中`的设备更新为`未解析`
            dispatch({ type: 'updateAllDeviceParseState', payload: ParseState.NotParse });
        },
        /**
         * 查询BCP生成配置信息
         */
        queryBcpConf() {
            ipcRenderer.send('query-bcp-conf');
            ipcRenderer.on('query-bcp-conf-result', (event: IpcRendererEvent, result: Record<string, any>) => {
                const { success, data } = result;
                if (success) {
                    //存入localStorage，自动生成BCP时会读取
                    localStorage.setItem('manufacturer',
                        helper.isNullOrUndefinedOrEmptyString(data.row.manufacturer) ? '' : data.row.manufacturer);
                    localStorage.setItem('security_software_orgcode',
                        helper.isNullOrUndefinedOrEmptyString(data.row.security_software_orgcode) ? '' : data.row.security_software_orgcode);
                    localStorage.setItem('materials_name',
                        helper.isNullOrUndefinedOrEmptyString(data.row.materials_name) ? '' : data.row.materials_name);
                    localStorage.setItem('materials_model',
                        helper.isNullOrUndefinedOrEmptyString(data.row.materials_model) ? '' : data.row.materials_model);
                    localStorage.setItem('materials_hardware_version',
                        helper.isNullOrUndefinedOrEmptyString(data.row.materials_hardware_version) ? '' : data.row.materials_hardware_version);
                    localStorage.setItem('materials_software_version',
                        helper.isNullOrUndefinedOrEmptyString(data.row.materials_software_version) ? '' : data.row.materials_software_version);
                    localStorage.setItem('materials_serial',
                        helper.isNullOrUndefinedOrEmptyString(data.row.materials_serial) ? '' : data.row.materials_serial);
                    localStorage.setItem('ip_address',
                        helper.isNullOrUndefinedOrEmptyString(data.row.ip_address) ? '' : data.row.ip_address);
                }
            });
        }
    }
}

export { StoreData };
export default model;