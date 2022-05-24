import round from 'lodash/round';
import path from 'path';
import { execFile, spawn } from 'child_process';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { SubscriptionAPI } from 'dva';
import { routerRedux } from 'dva/router';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import logger from '@utils/log';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { request } from '@utils/request';
import { ParseState } from '@src/schema/socket/DeviceState';
import { DataMode } from '@src/schema/DataMode';
import { AppCategory } from '@src/schema/AppConfig';
import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';

const cwd = process.cwd();
const { useBcp, useServerCloud, useTraceLogin, cloudAppMd5, cloudAppUrl } = helper.readConf();

export default {
    /**
     * 退出应用
     */
    exitApp({ dispatch }: SubscriptionAPI) {
        ipcRenderer.on('will-close', (event: IpcRendererEvent) => {
            dispatch({ type: 'fetchingAndParsingState' });
        });
    },
    /**
     * 启动应用时更新所有设备为`解析中`的记录
     */
    initAllDeviceParseState({ dispatch }: SubscriptionAPI) {
        //NOTE: 当设备还有正在解析或采集时关闭了应用，下一次启动
        //NOTE: UI时要把所有为`解析中`和`采集中`的设备更新为`未解析`
        dispatch({ type: 'updateAllDeviceParseState', payload: ParseState.NotParse });
    },
    /**
     * 查询软硬件配置信息
     * 写入LocalStorage（创建BCP需要此数据）
     */
    async queryManufacturer() {
        const jsonPath =
            process.env['NODE_ENV'] === 'development'
                ? path.join(cwd, './data/manufaturer.json')
                : path.join(cwd, './resources/config/manufaturer.json');
        try {
            const exist = await helper.existFile(jsonPath);
            if (exist) {
                const data = await helper.readManufaturer();
                localStorage.setItem('manufacturer', data?.manufacturer ?? '');
                localStorage.setItem('security_software_orgcode', data?.security_software_orgcode ?? '');
                localStorage.setItem('materials_name', data?.materials_name ?? '');
                localStorage.setItem('materials_model', data?.materials_model ?? '');
                localStorage.setItem('materials_hardware_version', data?.materials_hardware_version ?? '');
                localStorage.setItem('materials_software_version', data?.materials_software_version ?? '');
                localStorage.setItem('materials_serial', data?.materials_serial ?? '');
                localStorage.setItem('ip_address', data?.ip_address ?? '');
            } else {
                localStorage.setItem('manufacturer', '');
                localStorage.setItem('security_software_orgcode', '');
                localStorage.setItem('materials_name', '');
                localStorage.setItem('materials_model', '');
                localStorage.setItem('materials_hardware_version', '');
                localStorage.setItem('materials_software_version', '');
                localStorage.setItem('materials_serial', '');
                localStorage.setItem('ip_address', '');
            }
        } catch (error) {
            logger.error(`软硬件信息数据写入LocalStorage失败：${error.message}`);
        }
    },
    /**
     * 读取conf配置文件、JSON等，将模式、版本等同步到localStorage中
     */
    async initConfig() {
        let checkJsonPath = cwd;//点验JSON文件路径
        let platformJsonPath = cwd; //平台JSON文件路径
        if (process.env['NODE_ENV'] === 'development') {
            checkJsonPath = path.join(cwd, 'data/check.json');
            platformJsonPath = path.join(cwd, 'data/platform.json');
        } else {
            checkJsonPath = path.join(cwd, 'resources/data/check.json');
            platformJsonPath = path.join(cwd, 'resources/data/platform.json');
        }

        try {
            const [existCheck, existPlatform] = await Promise.all([
                helper.existFile(checkJsonPath),
                helper.existFile(platformJsonPath)
            ]);
            let mode = DataMode.Self;

            if (existCheck) {
                let checkJson = await helper.readJSONFile(checkJsonPath);
                if (checkJson.isCheck) {
                    mode = DataMode.Check;
                }
            }
            if (existPlatform) {
                let platformJson = await helper.readJSONFile(platformJsonPath);
                if (platformJson.usePlatform) {
                    mode = DataMode.GuangZhou;
                }
            }
            localStorage.setItem(LocalStoreKey.DataMode, mode.toString());

            if (localStorage.getItem(LocalStoreKey.UseDefaultTemp) === null) {
                //如果未设置`使用默认模版`，则置为'1'
                localStorage.setItem(LocalStoreKey.UseDefaultTemp, '1');
            }
        } catch (error) {
            localStorage.setItem(LocalStoreKey.DataMode, DataMode.Self.toString());
        }
    },
    /**
     * 启动应用后将采集单位&目的检验单位写入JSON
     * LEGACY:此方法为兼容旧版而处理,以后可将删除
     */
    writeUnitJson() {
        let jsonSavePath = ''; //JSON文件路径
        if (process.env['NODE_ENV'] === 'development') {
            jsonSavePath = path.join(cwd, 'data/unit.json');
        } else {
            jsonSavePath = path.join(cwd, 'resources/data/unit.json');
        }
        let unitCode = localStorage.getItem(LocalStoreKey.UnitCode);
        let unitName = localStorage.getItem(LocalStoreKey.UnitName);
        let dstUnitCode = localStorage.getItem(LocalStoreKey.DstUnitCode);
        let dstUnitName = localStorage.getItem(LocalStoreKey.DstUnitName);
        helper.writeJSONfile(jsonSavePath, {
            customUnit: useBcp ? 0 : 1, //非BCP版本使用自定义单位1
            unitCode,
            unitName,
            dstUnitCode,
            dstUnitName
        });
    },
    /**
     * 导出报告消息
     */
    reportExportMessage({ dispatch }: SubscriptionAPI) {
        ipcRenderer.on('report-export-finish', (event: IpcRendererEvent,
            success: boolean, exportCondition: Record<string, any>,
            isBatch: boolean, msgId: string) => {
            const { reportName } = exportCondition;
            dispatch({ type: 'removeAlertMessage', payload: msgId });
            dispatch({ type: 'innerPhoneTable/setExportingDeviceId', payload: [] });
            if (isBatch) {
                if (success) {
                    notification.success({
                        type: 'success',
                        message: '批量导出报告成功',
                        description: `所有报告已成功导出`,
                        duration: 0
                    });
                } else {
                    notification.error({
                        type: 'error',
                        message: '批量导出报告失败',
                        description: `批量导出报告失败`,
                        duration: 0
                    });
                }
            } else {
                if (success) {
                    notification.success({
                        type: 'success',
                        message: '报告导出成功',
                        description: `「${reportName}」已成功导出`,
                        duration: 0
                    });
                } else {
                    notification.error({
                        type: 'error',
                        message: '报告导出失败',
                        description: `「${reportName}」导出失败`,
                        duration: 0
                    });
                }
            }
        });
        ipcRenderer.on('update-export-msg', (event: IpcRendererEvent, args: AlarmMessageInfo) => {
            dispatch({ type: 'updateAlertMessage', payload: args });
        });
    },
    /**
     * 应用所在盘容量过底警告
     */
    async appSpaceWarning() {
        const { root } = path.parse(cwd);
        const [disk] = root.split(path.sep);

        try {
            const { FreeSpace } = await helper.getDiskInfo(disk, true);
            if (FreeSpace <= 5) {
                logger.warn(`取证程序所在磁盘空间不足，${disk}剩余${round(FreeSpace, 2)}GB，强制退出`);
                Modal.error({
                    title: '磁盘空间不足',
                    content: `软件所在磁盘（${disk}）空间不足，请清理数据`,
                    okText: '退出',
                    centered: true,
                    onOk() {
                        ipcRenderer.send('do-close');
                    }
                });
            }
        } catch (error) {
            logger.error(`查询磁盘容量失败,盘符:${disk},错误消息：${error.message}`);
        }
    },
    /**
     * 调用接口查询云取App
     */
    async validCloudAppMd5({ dispatch }: SubscriptionAPI) {

        const md5Url = cloudAppMd5 ?? helper.VALID_CLOUD_APP_URL;
        const fetchUrl = cloudAppUrl ?? helper.FETCH_CLOUD_APP_URL;

        if (useServerCloud) {
            let hide = message.loading('正在获取云取应用...');
            try {
                const [res, { code, data }] = await Promise.all([
                    fetch(md5Url),
                    request<{ fetch: AppCategory[] }>(fetchUrl)
                ]);
                if (res.status >= 200 && res.status < 300) {
                    const md5 = await res.text();
                    if (code === 0) {
                        dispatch({ type: 'setCloudAppData', payload: data.fetch });
                        hide();
                    } else {
                        hide();
                        message.error('云取证应用数据获取失败');
                        logger.error(`云取证应用数据获取失败 @model/dashboard/subscriptions/validCloudAppMd5: request()查询结果错误 code == 1`);
                    }
                    localStorage.setItem(LocalStoreKey.CloudAppMd5, md5);
                }
            } catch (error) {
                logger.error(`云取证应用数据获取失败 @model/dashboard/subscriptions/validCloudAppMd5: ${error.message}`);
                hide();
                message.error('云取证应用数据获取失败');
            }
        }
    },
    /**
     * 跳转页面
     */
    gotoUrl({ dispatch }: SubscriptionAPI) {
        ipcRenderer.on('go-to-url', (event: IpcRendererEvent, url: string) => {
            dispatch(routerRedux.push(url));
        });
    },
    /**
     * 读取本地存储发送给主进程
     */
    getStorage() {
        ipcRenderer.on('get-storage', (event: IpcRendererEvent, key: string) => {
            ipcRenderer.send('get-storage', localStorage.getItem(key));
        });
    }
};