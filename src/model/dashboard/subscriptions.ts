import path from 'path';
import { app, ipcRenderer, IpcRendererEvent, remote } from 'electron';
import { SubscriptionAPI } from 'dva';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import logger from '@utils/log';
import IndexedDb from '@utils/db';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { DbInstance } from '@src/type/model';
import { TableName } from '@src/schema/db/TableName';
import { ParseState } from '@src/schema/socket/DeviceState';
import { DataMode } from '@src/schema/DataMode';
import { UseMode } from '@src/schema/UseMode';

const getDb = remote.getGlobal('getDb');
const config = helper.readConf();
const appRootPath = process.cwd();

export default {
    async initDbDir({ dispatch }: SubscriptionAPI) {
        let modal: any = null;
        try {
            let exist = await helper.existFile(path.join(appRootPath, 'qzdb'));
            if (!exist) {
                logger.info(`Backup IndexedDB data`);
                modal = Modal.info({
                    content: '正在读取数据，请稍候...',
                    okText: '确定',
                    maskClosable: false,
                    okButtonProps: { disabled: true, icon: 'loading' }
                });
                const dir = path.join(appRootPath, 'qzdb');
                await helper.mkDir(dir);
                const caseFrom = new IndexedDb(TableName.Case);
                const deviceFrom = new IndexedDb(TableName.Device);
                const officerFrom = new IndexedDb(TableName.Officer);
                const fetchLogFrom = new IndexedDb(TableName.FetchLog);
                const parseLogFrom = new IndexedDb(TableName.ParseLog);

                const caseTo: DbInstance = getDb(TableName.Case);
                const deviceTo: DbInstance = getDb(TableName.Device);
                const officerTo: DbInstance = getDb(TableName.Officer);
                const fetchLogTo: DbInstance = getDb(TableName.FetchLog);
                const parseLogTo: DbInstance = getDb(TableName.ParseLog);

                const [caseData, deviceData, officerData, fetchLogData, parseLogData] = await Promise.allSettled([
                    caseFrom.all(),
                    deviceFrom.all(),
                    officerFrom.all(),
                    fetchLogFrom.all(),
                    parseLogFrom.all(),
                ]);

                let tasks = [];

                if (caseData.status === 'fulfilled') {
                    tasks.push(caseTo.insert(caseData.value));
                }
                if (deviceData.status === 'fulfilled') {
                    tasks.push(deviceTo.insert(deviceData.value));
                }
                if (officerData.status === 'fulfilled') {
                    tasks.push(officerTo.insert(officerData.value));
                }
                if (fetchLogData.status === 'fulfilled') {
                    tasks.push(fetchLogTo.insert(fetchLogData.value));
                }
                if (parseLogData.status === 'fulfilled') {
                    tasks.push(parseLogTo.insert(parseLogData.value));
                }
                await Promise.allSettled(tasks);
                modal.destroy();
            }
        } catch (error) {
            console.log(`备份IndexedDB数据失败： ${error.message}`);
            logger.error(`备份IndexedDB数据失败： ${error.message}`);
            if (modal !== null) {
                modal.destroy();
            }
        }
    },
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
                ? path.join(appRootPath, './data/manufaturer.json')
                : path.join(appRootPath, './resources/config/manufaturer.json');
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
        localStorage.setItem('UseMode', config.useMode.toString());

        let checkJsonPath = appRootPath;//点验JSON文件路径
        let platformJsonPath = appRootPath; //平台JSON文件路径
        if (process.env['NODE_ENV'] === 'development') {
            checkJsonPath = path.join(appRootPath, 'data/check.json');
            platformJsonPath = path.join(appRootPath, 'data/platform.json');
        } else {
            checkJsonPath = path.join(appRootPath, 'resources/data/check.json');
            platformJsonPath = path.join(appRootPath, 'resources/data/platform.json');
        }
        try {

            const [existCheck, existPlatform] = await Promise.all([helper.existFile(checkJsonPath), helper.existFile(platformJsonPath)]);
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
            jsonSavePath = path.join(appRootPath, 'data/unit.json');
        } else {
            jsonSavePath = path.join(appRootPath, 'resources/data/unit.json');
        }
        let unitCode = localStorage.getItem(LocalStoreKey.UnitCode);
        let unitName = localStorage.getItem(LocalStoreKey.UnitName);
        let dstUnitCode = localStorage.getItem(LocalStoreKey.DstUnitCode);
        let dstUnitName = localStorage.getItem(LocalStoreKey.DstUnitName);
        helper.writeJSONfile(jsonSavePath, {
            customUnit: config.useMode === UseMode.Army ? 1 : 0, //军队版本将自定义单位置为1
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
        ipcRenderer.on('report-export-finish', (event: IpcRendererEvent, success: boolean, exportCondition: Record<string, any>, msgId: string) => {
            const { reportName } = exportCondition;
            dispatch({ type: 'removeAlertMessage', payload: msgId });
            dispatch({ type: 'innerPhoneTable/setExportingDeviceId', payload: null });
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
        });
    },
    /**
     * 应用所在盘容量过底警告
     */
    async appSpaceWarning() {
        const appPath = app.getAppPath();
        const { root } = path.parse(appPath);
        const [disk] = root.split(path.sep);

        try {
            const { FreeSpace } = await helper.getDiskInfo(disk, true);
            if (FreeSpace <= 5) {
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
    }
};