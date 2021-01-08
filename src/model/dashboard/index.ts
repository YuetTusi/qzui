import path from 'path';
import { AnyAction } from 'redux';
import { ipcRenderer, IpcRendererEvent, remote } from 'electron';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import { TableName } from '@src/schema/db/TableName';
import { ParseState } from '@src/schema/socket/DeviceState';
import DeviceType from '@src/schema/socket/DeviceType';
import SendCase from '@src/schema/platform/GuangZhou/SendCase';
import Officer from '@src/schema/Officer';
import { UseMode } from '@src/schema/UseMode';
import { DataMode } from '@src/schema/DataMode';
import { DbInstance } from '@src/type/model';
import { helper } from '@src/utils/helper';
import { LocalStoreKey } from '@src/utils/localStore';
import logger from '@src/utils/log';
import IndexedDb from '@src/utils/db';
import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';

const getDb = remote.getGlobal('getDb');
const config = helper.readConf();
const appRootPath = process.cwd();

interface DashboardStore {
    /**
     * 接收平台案件数据
     */
    sendCase: SendCase | null,
    /**
     * 接收警综采集人员
     */
    sendOfficer: Officer[],
    /**
     * 全局警告消息，无消息为空数组
     */
    alertMessage: AlarmMessageInfo[]
}

/**
 * 首个加载的Model
 * #在此统一处理全局性操作
 */
let model: Model = {
    namespace: 'dashboard',
    state: {
        sendCase: null,
        sendOfficer: [],
        useMode: UseMode.Standard,
        alertMessage: []
    },
    reducers: {
        /**
         * 设置警综平台数据
         * @param {SendCase | null} payload 平台数据，清空数据传null
         */
        setSendCase(state: DashboardStore, { payload }: AnyAction) {
            state.sendCase = payload;
            return state;
        },
        /**
         * 设置警综平台采集人员
         * @param {Officer} payload 采集人员对象
         */
        setSendOfficer(state: DashboardStore, { payload }: AnyAction) {
            state.sendOfficer = [payload];
            return state;
        },
        /**
         * 添加全局提示消息
         * @param {AlarmMessageInfo} payload 消息内容（一条）
         */
        addAlertMessage(state: DashboardStore, { payload }: AnyAction) {
            state.alertMessage.push(payload);
            return state;
        },
        /**
         * 删除id的消息
         * @param {string} payload 唯一id
         */
        removeAlertMessage(state: DashboardStore, { payload }: AnyAction) {
            const next = state.alertMessage.filter(i => i.id !== payload);
            state.alertMessage = next;
            return state;
        }
    },
    effects: {
        /**
         * 退出前检测采集&解析状态
         */
        *fetchingAndParsingState({ payload }: AnyAction, { select }: EffectsCommandMap) {

            const title = localStorage.getItem('materials_name');

            let question = `确认退出${title}？`;
            Modal.destroyAll();
            Modal.confirm({
                title: '退出',
                content: question,
                okText: '是',
                cancelText: '否',
                onOk() {
                    localStorage.removeItem(LocalStoreKey.CaseData);
                    ipcRenderer.send('do-close', true);
                }
            });
        },
        /**
         * 将案件下所有设备为`解析中`和`采集中`更新为新状态
         * @param {ParseState} payload 解析状态
         */
        *updateAllDeviceParseState({ payload }: AnyAction, { call, fork }: EffectsCommandMap) {
            const db: DbInstance<DeviceType> = getDb(TableName.Device);
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
                    : path.join(appRootPath, './resources/data/manufaturer.json');
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
            localStorage.setItem('UseMode', config.useMode);

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
        }
    }
}

export { DashboardStore };
export default model;