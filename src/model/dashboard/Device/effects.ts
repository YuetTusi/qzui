import { mkdirSync } from 'fs';
import path from 'path';
import { ipcRenderer, remote } from "electron";
import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import moment from 'moment';
import uuid from 'uuid/v4';
import message from 'antd/lib/message';
import { send } from "@src/service/tcpServer";
// import Db from '@utils/db';
import logger from "@src/utils/log";
import { caseStore, LocalStoreKey } from "@src/utils/localStore";
import { helper } from '@utils/helper';
import UserHistory, { HistoryKeys } from "@src/utils/userHistory";
import { TableName } from "@src/schema/db/TableName";
import CCaseInfo from "@src/schema/CCaseInfo";
import DeviceType from "@src/schema/socket/DeviceType";
import FetchLog from "@src/schema/socket/FetchLog";
import FetchData from "@src/schema/socket/FetchData";
import TipType from "@src/schema/socket/TipType";
import { FetchState, ParseState } from "@src/schema/socket/DeviceState";
import CommandType, { SocketType } from "@src/schema/socket/Command";
import { ParseEnd } from '@src/schema/socket/ParseLog';
import ParseLogEntity from '@src/schema/socket/ParseLog';
import { DataMode } from '@src/schema/DataMode';
import { BcpEntity } from '@src/schema/socket/BcpEntity';
import SendCase from '@src/schema/platform/GuangZhou/SendCase';
import { StoreState } from './index';
import { DbInstance } from '@src/type/model';

const { dialog } = remote;
const getDb = remote.getGlobal('getDb');

/**
 * 副作用
 */
export default {
    /**
     * 查询案件数据是否为空
     */
    *queryEmptyCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
        try {
            let count = yield call([db, 'count'], null);
            yield put({ type: 'setEmptyCase', payload: count === 0 });
        } catch (error) {
            console.log(`查询案件非空失败 @model/dashboard/Device/effects/queryEmptyCase: ${error.message}`);
            logger.error(`查询案件非空失败 @model/dashboard/Device/effects/queryEmptyCase: ${error.message}`);
        }
    },
    /**
     * 保存手机数据到案件下
     * @param {string} payload.id 案件id
     * @param {DeviceType} payload.data 设备数据
     */
    *saveDeviceToCase({ payload }: AnyAction, { call }: EffectsCommandMap) {

        const db: DbInstance<DeviceType> = getDb(TableName.Device);
        try {
            yield call([db, 'insert'], payload.data);
        } catch (error) {
            console.log(error);
            logger.error(`设备数据入库失败 @model/dashboard/Device/effects/saveDeviceToCase: ${error.message}`);
        }
    },
    /**
     * 手机连入时检测状态
     * # 当一部设备正在`采集中`时若有手机再次device_in或device_out
     * # 要将数据库中解析状态改为`采集异常`
     * @param {number} payload.usb USB序号
     */
    *checkWhenDeviceIn({ payload }: AnyAction, { put, select }: EffectsCommandMap) {
        const { usb }: { usb: number } = payload;
        const state: StoreState = yield select((state: any) => state.device);
        const current = state.deviceList[usb - 1]; //当前手机
        if (current?.fetchState === FetchState.Fetching && !helper.isNullOrUndefinedOrEmptyString(current.id)) {
            yield put({
                type: 'parse/updateParseState', payload: {
                    id: current.id,
                    parseState: ParseState.Exception
                }
            });
        }
    },
    /**
     * 更新数据库中设备解析状态
     * @param {string} payload.id 设备id
     * @param {ParseState} payload.parseState 解析状态
     */
    *updateParseState({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const { id, parseState } = payload;
        const db: DbInstance<DeviceType> = getDb(TableName.Device);
        try {
            yield call([db, 'update'], { id }, { $set: { parseState } });
            yield put({
                type: 'parseLog/queryParseLog', payload: {
                    condition: null,
                    current: 1,
                    pageSize: 15
                }
            });
        } catch (error) {
            logger.error(`更新解析状态入库失败 @model/dashboard/Device/effects/updateParseState: ${error.message}`);
        }
    },
    /**
     * 保存采集日志
     * @param {number} payload.usb USB序号
     * @param {FetchState} payload.state 采集结果（是有错还是成功）
     */
    *saveFetchLog({ payload }: AnyAction, { select }: EffectsCommandMap) {
        const { usb, state } = payload as { usb: number, state: FetchState };
        let device: StoreState = yield select((state: any) => state.device);
        let current = device.deviceList[usb - 1]; //当前采集完毕的手机
        let log = new FetchLog();
        log.fetchTime = new Date();
        log.mobileHolder = current.mobileHolder;
        log.mobileName = current.mobileName;
        log.mobileNo = current.mobileNo;
        log.note = current.note;
        log.state = state;
        //Log数据发送到主进程，传给fetchRecordWindow中进行入库处理
        ipcRenderer.send('fetch-finish', usb, log);
    },
    /**
     * 保存解析日志
     * @param {ParseEnd} payload 采集结束后ParseEnd数据
     */
    *saveParseLog({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const deviceDb: DbInstance<DeviceType> = getDb(TableName.Device);
        const parseLogDb: DbInstance<ParseLogEntity> = getDb(TableName.ParseLog);
        const {
            deviceId, isparseok, parseapps, u64parsestarttime, u64parseendtime
        } = (payload as ParseEnd);
        try {
            let deviceData: DeviceType = yield call([deviceDb, 'findOne'], { id: deviceId });
            let entity = new ParseLogEntity();
            entity.mobileName = deviceData?.mobileName;
            entity.mobileNo = deviceData?.mobileNo;
            entity.mobileHolder = deviceData?.mobileHolder;
            entity.note = deviceData?.note;
            entity.state = isparseok ? ParseState.Finished : ParseState.Error;
            entity.apps = parseapps;
            entity.startTime = u64parsestarttime === -1 ? undefined : new Date(moment.unix(u64parsestarttime).valueOf());
            entity.endTime = u64parseendtime === -1 ? undefined : new Date(moment.unix(u64parseendtime).valueOf());
            yield call([parseLogDb, 'insert'], entity);
            yield put({
                type: 'parseLog/queryParseLog', payload: {
                    condition: null,
                    current: 1,
                    pageSize: 15
                }
            });
        } catch (error) {
            console.log(`解析日志保存失败 @modal/dashboard/Device/effects/saveParseLog: ${error.message}`);
            logger.error(`解析日志保存失败 @modal/dashboard/Device/effects/saveParseLog: ${error.message}`);
        }
    },
    /**
     * 开始采集
     * @param {DeviceType} payload.deviceData 为当前设备数据
     * @param {FetchData} payload.fetchData 为当前采集输入数据
     */
    *startFetch({ payload }: AnyAction, { call, fork, put, select }: EffectsCommandMap) {
        const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
        let sendCase: SendCase | null = null;
        const { deviceData, fetchData } = payload as { deviceData: DeviceType, fetchData: FetchData };
        //NOTE:再次采集前要把采集记录清除
        ipcRenderer.send('progress-clear', deviceData.usb!);
        //NOTE:再次采集前要把案件数据清掉
        caseStore.remove(deviceData.usb!);
        caseStore.set({
            usb: deviceData.usb!,
            caseName: fetchData.caseName!,
            mobileHolder: fetchData.mobileHolder!,
            mobileNo: fetchData.mobileNo!
        });
        UserHistory.set(HistoryKeys.HISTORY_DEVICENAME, payload.fetchData.mobileName.split('_')[0]);
        UserHistory.set(HistoryKeys.HISTORY_DEVICEHOLDER, payload.fetchData.mobileHolder);
        UserHistory.set(HistoryKeys.HISTORY_DEVICENUMBER, payload.fetchData.mobileNo);

        if (!helper.isNullOrUndefined(fetchData.mobileNo)) {
            //# 如果输入了手机编号，拼到手机名称之前
            fetchData.mobileName = fetchData.mobileNo!.trim() + fetchData.mobileName;
        }

        //拼接手机完整路径
        let phonePath = path.join(fetchData.casePath!, fetchData.caseName!,
            fetchData.mobileHolder!, fetchData.mobileName!);

        //NOTE:将设备数据入库
        let rec: DeviceType = { ...deviceData };
        rec.mobileHolder = fetchData.mobileHolder;
        rec.mobileNo = fetchData.mobileNo;
        rec.mobileName = fetchData.mobileName;
        rec.note = fetchData.note;
        rec.fetchTime = new Date(moment().add(deviceData.usb, 's').valueOf());
        rec.phonePath = phonePath;
        rec.id = uuid();
        rec.caseId = fetchData.caseId;//所属案件id
        rec.parseState = ParseState.Fetching;

        let exist = yield helper.existFile(rec.phonePath);
        if (!exist) {
            //手机路径不存在，创建之
            mkdirSync(rec.phonePath, { recursive: true });
        }
        //将设备信息写入Device.json
        yield fork([helper, 'writeJSONfile'], path.join(rec.phonePath, 'Device.json'), {
            mobileHolder: rec.mobileHolder ?? '',
            mobileNo: rec.mobileNo ?? '',
            mobileName: rec.mobileName ?? '',
            note: rec.note ?? ''
        });
        if (fetchData.mode === DataMode.GuangZhou) {
            sendCase = yield select((state: any) => state.dashboard.sendCase);//警综案件数据
            //将警综平台数据写入Platform.json，解析会读取
            yield fork([helper, 'writeJSONfile'], path.join(rec.phonePath, 'Platform.json'), sendCase);
        }

        try {
            const caseData: CCaseInfo = yield call([db, 'findOne'], { _id: fetchData.caseId });
            const bcp = new BcpEntity();
            if (helper.getDataMode() === DataMode.GuangZhou) {
                //警综
                bcp.mobilePath = phonePath;
                bcp.attachment = caseData.attachment;
                bcp.checkUnitName = caseData.m_strCheckUnitName ?? '';
                bcp.unitNo = sendCase?.dept ?? '';
                bcp.unitName = sendCase?.deptName ?? '';
                bcp.dstUnitNo = sendCase?.dept ?? '';
                bcp.dstUnitName = sendCase?.deptName ?? '';
                bcp.officerNo = sendCase?.OfficerID ?? '';
                bcp.officerName = sendCase?.OfficerName ?? '';
                bcp.mobileHolder = fetchData.mobileHolder!;
                bcp.bcpNo = '';
                bcp.phoneNumber = sendCase?.Phone ?? '';
                bcp.credentialType = sendCase?.IdentityIDTypeCode ?? '0';
                bcp.credentialNo = sendCase?.IdentityID ?? '';
                bcp.credentialEffectiveDate = '';
                bcp.credentialExpireDate = '';
                bcp.credentialOrg = '';
                bcp.credentialAvatar = '';
                bcp.gender = '0';
                bcp.nation = sendCase?.MinzuCode ?? '00';
                bcp.birthday = '';
                bcp.address = sendCase?.Dz ?? '';
                bcp.securityCaseNo = caseData.securityCaseNo ?? '';
                bcp.securityCaseType = caseData.securityCaseType ?? '';
                bcp.securityCaseName = caseData.securityCaseName ?? '';
                //LEGACY:目前为保证BCP文件上传成功，将`执法办案`相关4个字段存为固定空串
                bcp.handleCaseNo = '';
                bcp.handleCaseType = '';
                bcp.handleCaseName = '';
                bcp.handleOfficerNo = '';
                //LEGACY ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            } else {
                //非警综
                bcp.mobilePath = phonePath;
                bcp.attachment = caseData.attachment;
                bcp.checkUnitName = caseData.m_strCheckUnitName ?? '';
                bcp.unitNo = localStorage.getItem(LocalStoreKey.UnitCode) ?? '';
                bcp.unitName = localStorage.getItem(LocalStoreKey.UnitName) ?? '';
                bcp.dstUnitNo = localStorage.getItem(LocalStoreKey.DstUnitCode) ?? '';
                bcp.dstUnitName = localStorage.getItem(LocalStoreKey.DstUnitName) ?? '';
                bcp.officerNo = caseData.officerNo;
                bcp.officerName = caseData.officerName;
                bcp.mobileHolder = fetchData.mobileHolder!;
                bcp.bcpNo = '';
                bcp.phoneNumber = '';
                bcp.credentialType = '0';
                bcp.credentialNo = '';
                bcp.credentialEffectiveDate = '';
                bcp.credentialExpireDate = '';
                bcp.credentialOrg = '';
                bcp.credentialAvatar = '';
                bcp.gender = '0';
                bcp.nation = '00';
                bcp.birthday = '';
                bcp.address = '';
                bcp.securityCaseNo = caseData.securityCaseNo ?? '';
                bcp.securityCaseType = caseData.securityCaseType ?? '';
                bcp.securityCaseName = caseData.securityCaseName ?? '';
                //LEGACY:目前为保证BCP文件上传成功，将`执法办案`相关4个字段存为固定空串
                bcp.handleCaseNo = '';
                bcp.handleCaseType = '';
                bcp.handleCaseName = '';
                bcp.handleOfficerNo = '';
                //LEGACY ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            }
            yield fork([helper, 'writeBcpJson'], phonePath, bcp);
        } catch (error) {
            logger.error(`写Bcp.json失败 @model/dashboard/Device/effects/startFetch: ${error.message}`);
        } finally {
            if (fetchData.mode === DataMode.GuangZhou) {
                //* 写完Bcp.json清理平台案件，下一次取证前没有推送则不允许采集
                yield put({ type: 'dashboard/setSendCase', payload: null });
            }
        }

        yield put({
            type: 'saveDeviceToCase', payload: {
                id: fetchData.caseId,
                data: rec
            }
        });

        //采集时把必要的数据更新到deviceList中
        yield put({
            type: 'setDeviceToList', payload: {
                id: rec.id,
                usb: deviceData.usb,
                tipType: TipType.Nothing,
                fetchState: FetchState.Fetching,
                parseState: ParseState.NotParse,
                manufacturer: deviceData.manufacturer,
                model: deviceData.model,
                system: deviceData.system,
                mobileName: fetchData.mobileName,
                mobileNo: fetchData.mobileNo,
                mobileHolder: fetchData.mobileHolder,
                note: fetchData.note,
                isStopping: false,
                caseId: fetchData.caseId,
                serial: fetchData.serial,
                phonePath
            }
        });
        ipcRenderer.send('time', deviceData.usb! - 1, true);

        logger.info(`开始采集设备(StartFetch)：${JSON.stringify({
            usb: deviceData.usb!,
            caseName: fetchData.caseName,
            casePath: fetchData.casePath,
            appList: fetchData.appList,
            mobileName: fetchData.mobileName,
            mobileHolder: fetchData.mobileHolder,
            note: fetchData.note,
            credential: fetchData.credential,
            unitName: fetchData.unitName,
            sdCard: fetchData.sdCard ?? false,
            hasReport: fetchData.hasReport ?? false,
            isAuto: fetchData.isAuto,
            mode: fetchData.mode
        })}`);

        //# 通知fetch开始采集
        send(SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.StartFetch,
            msg: {
                usb: deviceData.usb!,
                caseName: fetchData.caseName,
                casePath: fetchData.casePath,
                appList: fetchData.appList,
                mobileName: fetchData.mobileName,
                mobileNo: fetchData.mobileNo,
                mobileHolder: fetchData.mobileHolder,
                note: fetchData.note,
                credential: fetchData.credential,
                unitName: fetchData.unitName,
                sdCard: fetchData.sdCard ?? false,
                hasReport: fetchData.hasReport ?? false,
                isAuto: fetchData.isAuto,
                mode: fetchData.mode,
                serial: fetchData.serial
            }
        });
    },
    /**
     * 开始解析
     * @param {number} payload USB序号
     */
    *startParse({ payload }: AnyAction, { select, call, put }: EffectsCommandMap) {

        const db = getDb(TableName.Case);

        let device: StoreState = yield select((state: any) => state.device);
        let current = device.deviceList.find((item) => item?.usb == payload);

        try {
            let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: current?.caseId });
            if (current && caseData.m_bIsAutoParse) {

                let useKeyword = localStorage.getItem(LocalStoreKey.UseKeyword) === '1';
                let dataMode = Number(localStorage.getItem(LocalStoreKey.DataMode));

                //# 数据存在且是`自动解析`
                console.log(`开始解析(StartParse): ${JSON.stringify({
                    type: SocketType.Parse,
                    cmd: CommandType.StartParse,
                    msg: {
                        phonePath: current.phonePath,
                        caseId: caseData._id,
                        deviceId: current.id,
                        hasReport: caseData.hasReport ?? false,
                        useKeyword,
                        dataMode
                    }
                })}`);
                logger.info(`开始解析(StartParse):${JSON.stringify({
                    phonePath: current.phonePath,
                    caseId: caseData._id,
                    deviceId: current.id,
                    hasReport: caseData.hasReport ?? false,
                    useKeyword,
                    dataMode
                })}`);
                //# 通知parse开始解析
                send(SocketType.Parse, {
                    type: SocketType.Parse,
                    cmd: CommandType.StartParse,
                    msg: {
                        phonePath: current.phonePath,
                        caseId: caseData._id,
                        deviceId: current.id,
                        hasReport: caseData.hasReport ?? false,
                        useKeyword,
                        dataMode
                    }
                });
                //# 更新数据记录为`解析中`状态
                yield put({
                    type: 'parse/updateParseState', payload: {
                        id: current.id,
                        parseState: ParseState.Parsing
                    }
                });
            } else {
                //# 非自动解析案件，把解析状态更新为`未解析`
                yield put({
                    type: 'parse/updateParseState', payload: {
                        id: current!.id,
                        parseState: ParseState.NotParse
                    }
                });
            }
        } catch (error) {
            logger.error(`开始解析失败 @model/dashboard/Device/effects/startParse: ${error.message}`);
        }
    },
    /**
     * 从警综平台获取案件数据入库
     * @param {DeviceType} payload.device 当前设备数据
     */
    *saveCaseFromPlatform({ payload }: AnyAction, { select, call, fork, put }: EffectsCommandMap) {
        const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
        const sendCase: SendCase = yield select((state: any) => state.dashboard.sendCase);//警综案件数据
        const { device } = payload as { device: DeviceType };

        if (helper.isNullOrUndefinedOrEmptyString(sendCase?.CaseName)) {
            message.warn('案件名称为空，请确认平台数据完整');
            return;
        }
        if (helper.isNullOrUndefinedOrEmptyString(sendCase?.OwnerName)) {
            message.warn('姓名为空，请确认平台数据完整');
            return;
        }

        try {
            const dbData: CCaseInfo[] = yield db.all(); //库中的案件数据
            const hasCase = dbData.find(item => {
                const [name] = item.m_strCaseName.split('_');
                return name === sendCase.CaseName;
            });

            if (hasCase === undefined) {
                //新增案件
                let filePaths = dialog.showOpenDialogSync({
                    title: '选择案件存储目录',
                    properties: ['openDirectory']
                });
                if (filePaths === undefined || filePaths.length === 0) { return; }
                //# 从警综平台数据中创建案件
                const newCase = new CCaseInfo();
                newCase._id = helper.newId();
                newCase.m_strCaseName = `${sendCase.CaseName!.replace(
                    /_/g,
                    ''
                )}_${helper.timestamp()}`;
                newCase.m_strCasePath = filePaths[0];
                newCase.m_strCheckUnitName = sendCase.deptName!;
                newCase.handleCaseNo = sendCase.CaseID!;
                newCase.handleCaseName = sendCase.CaseName!;
                newCase.handleCaseType = sendCase.CaseType!;
                newCase.securityCaseName = sendCase.CaseType!;
                newCase.officerName = sendCase.OfficerName!;
                newCase.officerNo = sendCase.OfficerID!;
                newCase.m_Applist = [];
                newCase.chooiseApp = false;
                newCase.sdCard = false;
                newCase.m_bIsAutoParse = true;
                newCase.generateBcp = true;
                newCase.attachment = false;
                newCase.hasReport = false;
                yield call([db, 'insert'], newCase);
                let exist = yield helper.existFile(path.join(newCase.m_strCasePath, newCase.m_strCaseName));
                if (!exist) {
                    //案件路径不存在，创建之
                    mkdirSync(path.join(newCase.m_strCasePath, newCase.m_strCaseName));
                }

                yield fork([helper, 'writeJSONfile'], path.join(newCase.m_strCasePath, newCase.m_strCaseName, 'Case.json'), {
                    caseName: newCase.m_strCaseName ?? '',
                    checkUnitName: newCase.m_strCheckUnitName ?? '',
                    officerName: newCase.officerName ?? '',
                    officerNo: newCase.officerNo ?? '',
                    securityCaseNo: newCase.securityCaseNo ?? '',
                    securityCaseType: newCase.securityCaseType ?? '',
                    securityCaseName: newCase.securityCaseName ?? '',
                    handleCaseNo: newCase.handleCaseNo ?? '',
                    handleCaseName: newCase.handleCaseName ?? '',
                    handleCaseType: newCase.handleCaseType ?? '',
                    handleOfficerNo: newCase.handleOfficerNo ?? ''
                });
                //# 从警综平台数据中创建设备采集数据
                const fetchData = new FetchData(); //采集数据
                fetchData.caseName = newCase.m_strCaseName;
                fetchData.caseId = newCase._id;
                fetchData.casePath = filePaths[0];
                fetchData.sdCard = newCase.sdCard;
                fetchData.isAuto = newCase.m_bIsAutoParse;
                fetchData.hasReport = newCase.hasReport;
                fetchData.unitName = sendCase.deptName;
                fetchData.mobileName = `${device.model ?? ''}_${helper.timestamp(device.usb)}`;
                fetchData.mobileNo = '';
                fetchData.mobileHolder = sendCase.OwnerName ?? '';
                fetchData.note = sendCase.Desc ?? '';
                fetchData.credential = sendCase.IdentityID ?? '';
                fetchData.serial = device.serial ?? '';
                fetchData.mode = DataMode.GuangZhou;
                fetchData.appList = [];
                //开始采集
                yield put({
                    type: 'startFetch', payload: {
                        deviceData: device,
                        fetchData
                    }
                });
            } else {
                //已存在案件
                //# 从警综平台创建
                const fetchData = new FetchData(); //采集数据
                fetchData.caseId = hasCase._id;
                fetchData.caseName = hasCase.m_strCaseName;
                fetchData.casePath = hasCase.m_strCasePath;
                fetchData.sdCard = hasCase.sdCard;
                fetchData.isAuto = hasCase.m_bIsAutoParse;
                fetchData.hasReport = hasCase.hasReport;
                fetchData.unitName = sendCase.deptName;
                fetchData.mobileName = `${device.model}_${helper.timestamp(device.usb)}`;
                fetchData.mobileNo = '';
                fetchData.mobileHolder = sendCase.OwnerName ?? '';
                fetchData.note = sendCase.Desc ?? '';
                fetchData.credential = sendCase.IdentityID ?? '';
                fetchData.serial = device.serial ?? '';
                fetchData.mode = DataMode.GuangZhou;
                fetchData.appList = [];

                yield put({
                    type: 'startFetch', payload: {
                        deviceData: device,
                        fetchData
                    }
                });
            }

        } catch (error) {
            message.error(`取证失败: ${error.message}`);
            logger.error(`警综平台获取数据取证失败 @model/dashboard/Device/effects/saveCaseFromPlatform: ${error.message}`);
        }
    }
};