import { mkdirSync } from 'fs';
import path from 'path';
import { ipcRenderer } from "electron";
import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import moment from 'moment';
import message from 'antd/lib/message';
import logger from "@utils/log";
import { helper } from '@utils/helper';
import { caseStore, LocalStoreKey } from "@utils/localStore";
import UserHistory, { HistoryKeys } from "@utils/userHistory";
import { send } from "@src/service/tcpServer";
import { TableName } from "@src/schema/db/TableName";
import CCaseInfo, { CaseType } from "@src/schema/CCaseInfo";
import DeviceType from "@src/schema/socket/DeviceType";
import FetchLog from "@src/schema/socket/FetchLog";
import FetchData from "@src/schema/socket/FetchData";
import TipType from "@src/schema/socket/TipType";
import { FetchState, ParseState } from "@src/schema/socket/DeviceState";
import CommandType, { SocketType } from "@src/schema/socket/Command";
import { ParseEnd } from '@src/schema/socket/ParseLog';
import ParseLogEntity from '@src/schema/socket/ParseLog';
import Officer from '@src/schema/Officer';
import { DataMode } from '@src/schema/DataMode';
import { CParseApp } from '@src/schema/CParseApp';
import { AttachmentType, BcpEntity } from '@src/schema/socket/BcpEntity';
import { SendCase } from '@src/schema/platform/GuangZhou/SendCase';
import { PhoneSystem } from '@src/schema/socket/PhoneSystem';
import { PredictJson } from '@src/view/case/AISwitch/prop';
import { StateTree } from '@src/type/model';
import parseApps from '@src/config/parse-app.yaml';
import { StoreState } from './index';

const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';
const { caseText } = helper.readConf();

/**
 * 副作用
 */
export default {
    /**
     * 查询案件数据是否为空
     */
    *queryEmptyCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        try {
            let count: number = yield call([ipcRenderer, 'invoke'], 'db-count', TableName.Case, null);
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
        const { data } = payload as { id: string, data: DeviceType };
        try {
            yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.Device, {
                _id: data._id,
                id: data.id,
                caseId: data.caseId,
                checker: data.checker,
                checkerNo: data.checkerNo,
                fetchState: data.fetchState,
                parseState: data.parseState,
                fetchTime: data.fetchTime,
                fetchType: data.fetchType,
                manufacturer: data.manufacturer,
                mobileHolder: data.mobileHolder,
                mobileName: data.mobileName,
                mobileNo: data.mobileNo,
                mobileNumber: data.mobileNumber,
                mode: data.mode ?? DataMode.Self,
                cloudAppList: data.cloudAppList ?? [],
                model: data.model,
                handleOfficerNo: data.handleOfficerNo ?? '',
                note: data.note,
                parseTime: data.parseTime,
                phonePath: data.phonePath,
                serial: data.serial,
                system: data.system ?? PhoneSystem.Android
            });
        } catch (error) {
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
        const state: StoreState = yield select((state: StateTree) => state.device);
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
        try {
            yield call([ipcRenderer, 'invoke'], 'db-update', TableName.Device, { id }, { $set: { parseState } });
            yield put({
                type: 'parseLog/queryParseLog', payload: {
                    condition: null,
                    current: 1,
                    pageSize: 10
                }
            });
        } catch (error) {
            logger.error(`更新解析状态入库失败 @model/dashboard/Device/effects/updateParseState: ${(error as any).message}`);
        }
    },
    /**
     * 保存采集日志
     * @param {number} payload.usb USB序号
     * @param {FetchState} payload.state 采集结果（是有错还是成功）
     */
    *saveFetchLog({ payload }: AnyAction, { select }: EffectsCommandMap) {
        const { usb, state } = payload as { usb: number, state: FetchState };
        let device: StoreState = yield select((state: StateTree) => state.device);
        let current = device.deviceList[usb - 1]; //当前采集完毕的手机
        let { caseName, spareName } = caseStore.get(usb);
        let log = new FetchLog();
        log.caseName = helper.isNullOrUndefinedOrEmptyString(spareName) ? caseName.split('_')[0] : spareName;
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
    *saveParseLog({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
        const {
            caseId, deviceId, isparseok, parseapps, u64parsestarttime, u64parseendtime
        } = (payload as ParseEnd);
        try {
            let [deviceData, caseData]: [DeviceType, CCaseInfo] = yield all([
                call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Device, { id: deviceId }),
                call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: caseId })
            ]);
            let entity = new ParseLogEntity();
            entity.caseName = helper.isNullOrUndefinedOrEmptyString(caseData.spareName) ? caseData.m_strCaseName.split('_')[0] : caseData.spareName;
            entity.mobileName = deviceData?.mobileName;
            entity.mobileNo = deviceData?.mobileNo;
            entity.mobileHolder = deviceData?.mobileHolder;
            entity.note = deviceData?.note;
            entity.state = isparseok ? ParseState.Finished : ParseState.Error;
            entity.apps = parseapps;
            entity.startTime = u64parsestarttime === -1 ? undefined : new Date(moment.unix(u64parsestarttime).valueOf());
            entity.endTime = u64parseendtime === -1 ? undefined : new Date(moment.unix(u64parseendtime).valueOf());
            yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.ParseLog, entity);
            yield put({
                type: 'parseLog/queryParseLog', payload: {
                    condition: null,
                    current: 1,
                    pageSize: 10
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
        // const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
        let sendCase: SendCase | null = null;
        const { deviceData, fetchData } = payload as { deviceData: DeviceType, fetchData: FetchData };
        // *再次采集前要把采集记录清除
        ipcRenderer.send('progress-clear', deviceData.usb!);
        // *开始计时 
        ipcRenderer.send('time', deviceData.usb! - 1, true);
        // *再次采集前要把案件数据清掉
        caseStore.remove(deviceData.usb!);
        caseStore.set({
            usb: deviceData.usb!,
            caseName: fetchData.caseName!,
            spareName: fetchData.spareName ?? '',
            mobileHolder: fetchData.mobileHolder!,
            mobileNo: fetchData.mobileNo!
        });
        UserHistory.set(HistoryKeys.HISTORY_DEVICENAME, fetchData.mobileName!.split('_')[0]);
        UserHistory.set(HistoryKeys.HISTORY_DEVICEHOLDER, fetchData.mobileHolder!);
        UserHistory.set(HistoryKeys.HISTORY_DEVICENUMBER, fetchData.mobileNo!);
        UserHistory.set(HistoryKeys.HISTORY_MOBILENUMBER, fetchData.mobileNumber!);

        if (!helper.isNullOrUndefined(fetchData.mobileNo)) {
            //# 如果输入了手机编号，拼到手机名称之前
            fetchData.mobileName = fetchData.mobileNo! + fetchData.mobileName;
        }

        //拼接手机完整路径
        let phonePath = path.join(fetchData.casePath!, fetchData.caseName!,
            fetchData.mobileHolder!, fetchData.mobileName!);

        //NOTE:将设备数据入库
        let rec: DeviceType = { ...deviceData };
        rec.mobileHolder = fetchData.mobileHolder;
        rec.mobileNo = fetchData.mobileNo;
        rec.mobileNumber = fetchData.mobileNumber;
        rec.mobileName = fetchData.mobileName!.replace(/[\\/]/g, '');//过滤斜杠
        rec.handleOfficerNo = fetchData.handleOfficerNo;
        rec.note = fetchData.note;
        rec.mode = fetchData.mode;
        rec.fetchTime = new Date(moment().add(deviceData.usb, 's').valueOf());
        rec.phonePath = phonePath;
        rec.id = helper.newId();
        rec.caseId = fetchData.caseId;//所属案件id
        rec.parseState = ParseState.Fetching;
        rec.cloudAppList = fetchData.cloudAppList;

        let exist: boolean = yield call([helper, 'existFile'], rec.phonePath);
        if (!exist) {
            //手机路径不存在，创建之
            mkdirSync(rec.phonePath, { recursive: true });
        }
        //将设备信息写入Device.json
        yield fork([helper, 'writeJSONfile'], path.join(rec.phonePath, 'Device.json'), {
            mobileHolder: rec.mobileHolder ?? '',
            mobileNo: rec.mobileNo ?? '',
            mobileName: rec.mobileName ?? '',
            note: rec.note ?? '',
            mode: rec.mode ?? DataMode.Self
        });
        if (fetchData.mode === DataMode.GuangZhou) {
            sendCase = yield select((state: StateTree) => state.dashboard.sendCase);//警综案件数据
            rec.handleOfficerNo = sendCase?.ObjectID ?? ''; //#持有人编号从警经综数据接收
            //将警综平台数据写入Platform.json，解析会读取
            yield fork([helper, 'writeJSONfile'], path.join(rec.phonePath, 'Platform.json'), sendCase);
        }

        try {
            const caseData: CCaseInfo = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: fetchData.caseId });
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
                bcp.remark = fetchData.note ?? '';
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
                bcp.handleCaseNo = caseData.handleCaseNo ?? '';
                bcp.handleCaseType = caseData.handleCaseType ?? '';
                bcp.handleCaseName = caseData.handleCaseName ?? '';
                bcp.handleOfficerNo = sendCase?.ObjectID ?? '';
                //LEGACY ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                yield fork([helper, 'writeBcpJson'], phonePath, { ...bcp, ...sendCase });
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
                bcp.remark = fetchData.note ?? '';
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
                bcp.handleCaseNo = caseData.handleCaseNo ?? '';
                bcp.handleCaseType = caseData.handleCaseType ?? '';
                bcp.handleCaseName = caseData.handleCaseName ?? '';
                bcp.handleOfficerNo = fetchData.handleOfficerNo ?? '';
                yield fork([helper, 'writeBcpJson'], phonePath, bcp);
            }
        } catch (error) {
            logger.error(`Bcp.json写入失败 @model/dashboard/Device/effects/startFetch: ${error.message}`);
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
                fetchPercent: 0,
                fetchState: FetchState.Fetching,
                parseState: ParseState.NotParse,
                manufacturer: deviceData.manufacturer,
                model: deviceData.model,
                system: deviceData.system,
                mobileName: fetchData.mobileName,
                mobileNo: fetchData.mobileNo,
                mobileNumber: fetchData.mobileNumber ?? '',
                mobileHolder: fetchData.mobileHolder,
                note: fetchData.note,
                isStopping: false,
                caseId: fetchData.caseId,
                serial: fetchData.serial,
                mode: fetchData.mode,
                phonePath,
                cloudAppList: deviceData.cloudAppList ?? []
            }
        });

        //# 通知fetch开始采集
        yield fork(send, SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.StartFetch,
            msg: {
                usb: deviceData.usb,
                mode: fetchData.mode,
                caseName: fetchData.caseName,
                casePath: fetchData.casePath,
                appList: fetchData.appList,
                cloudAppList: fetchData.cloudAppList,
                mobileName: fetchData.mobileName,
                mobileNo: fetchData.mobileNo,
                mobileHolder: fetchData.mobileHolder,
                mobileNumber: fetchData.mobileNumber ?? '',
                note: fetchData.note,
                credential: fetchData.credential,
                unitName: fetchData.unitName,
                sdCard: fetchData.sdCard ?? false,
                hasReport: fetchData.hasReport ?? false,
                analysisApp: fetchData.analysisApp ?? true,
                isAuto: fetchData.isAuto,
                isRoot: fetchData.isRoot ?? false,
                serial: fetchData.serial,
                cloudTimeout: fetchData.cloudTimeout ?? helper.CLOUD_TIMEOUT,
                cloudTimespan: fetchData.cloudTimespan ?? helper.CLOUD_TIMESPAN,
                isAlive: fetchData.isAlive ?? helper.IS_ALIVE
            }
        });

        logger.info(`开始采集(StartFetch)：${JSON.stringify({
            usb: deviceData.usb,
            mode: fetchData.mode,
            caseName: fetchData.caseName,
            casePath: fetchData.casePath,
            appList: fetchData.appList,
            cloudAppList: fetchData.cloudAppList,
            mobileName: fetchData.mobileName,
            mobileNo: fetchData.mobileNo,
            mobileHolder: fetchData.mobileHolder,
            mobileNumber: fetchData.mobileNumber ?? '',
            note: fetchData.note,
            credential: fetchData.credential,
            unitName: fetchData.unitName,
            sdCard: fetchData.sdCard ?? false,
            hasReport: fetchData.hasReport ?? false,
            analysisApp: fetchData.analysisApp ?? true,
            isAuto: fetchData.isAuto,
            isRoot: fetchData.isRoot ?? false,
            serial: fetchData.serial,
            cloudTimeout: fetchData.cloudTimeout ?? helper.CLOUD_TIMEOUT,
            cloudTimespan: fetchData.cloudTimespan ?? helper.CLOUD_TIMESPAN,
            isAlive: fetchData.isAlive ?? helper.IS_ALIVE
        })}`);
    },
    /**
     * 开始解析
     * @param {number} payload USB序号
     */
    *startParse({ payload }: AnyAction, { select, all, call, fork, put }: EffectsCommandMap) {
        const device: StoreState = yield select((state: StateTree) => state.device);
        const current = device.deviceList.find((item) => item?.usb == payload);
        let aiConfig: PredictJson = { config: [], similarity: 0, ocr: false };
        const tempAt = isDev
            ? path.join(cwd, './data/predict.json')
            : path.join(cwd, './resources/config/predict.json'); //模版路径

        try {
            const [caseData, aiTemp]: [CCaseInfo, PredictJson] = yield all([
                call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: current?.caseId }),
                call([helper, 'readJSONFile'], tempAt)
            ]);
            const predictAt = path.join(caseData.m_strCasePath, caseData.m_strCaseName, 'predict.json');
            const exist: boolean = yield call([helper, 'existFile'], predictAt);
            if (exist) {
                //案件下存在predict.json
                aiConfig = yield call([helper, 'readJSONFile'], predictAt);
            }

            if (current && caseData.m_bIsAutoParse) {
                const useDefaultTemp = localStorage.getItem(LocalStoreKey.UseDefaultTemp) === '1';
                const useKeyword = localStorage.getItem(LocalStoreKey.UseKeyword) === '1';
                const useDocVerify = localStorage.getItem(LocalStoreKey.UseDocVerify) === '1';
                const usePdfOcr = localStorage.getItem(LocalStoreKey.UsePdfOcr) === '1';
                const tokenAppList: string[] = caseData.tokenAppList ? caseData.tokenAppList.map(i => i.m_strID) : [];
                const aiTypes = helper.combinePredict(aiTemp, aiConfig);
                logger.info(`开始解析(StartParse):${JSON.stringify({
                    caseId: caseData._id,
                    deviceId: current.id,
                    phonePath: current.phonePath,
                    ruleFrom: caseData.ruleFrom ?? 0,
                    ruleTo: caseData.ruleTo ?? 8,
                    dataMode: current.mode ?? DataMode.Self,
                    hasReport: caseData.hasReport ?? false,
                    isDel: caseData.isDel ?? false,
                    isAi: caseData.isAi ?? false,
                    useAiOcr: !caseData.isPhotoAnalysis,
                    isPhotoAnalysis: caseData.isPhotoAnalysis ?? false,
                    aiTypes,
                    useDefaultTemp,
                    useKeyword,
                    useDocVerify: [useDocVerify, usePdfOcr],
                    tokenAppList
                })}`);
                //# 通知parse开始解析
                yield fork(send, SocketType.Parse, {
                    type: SocketType.Parse,
                    cmd: CommandType.StartParse,
                    msg: {
                        caseId: caseData._id,
                        deviceId: current.id,
                        phonePath: current.phonePath,
                        ruleFrom: caseData.ruleFrom ?? 0,
                        ruleTo: caseData.ruleTo ?? 8,
                        dataMode: current.mode ?? DataMode.Self,
                        hasReport: caseData.hasReport ?? false,
                        isDel: caseData.isDel ?? false,
                        isAi: caseData.isAi ?? false,
                        useAiOcr: !caseData.isPhotoAnalysis,
                        isPhotoAnalysis: caseData.isPhotoAnalysis ?? false,
                        aiTypes,
                        useDefaultTemp,
                        useKeyword,
                        useDocVerify: [useDocVerify, usePdfOcr],
                        tokenAppList
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
        const sendCase: SendCase = yield select((state: StateTree) => state.dashboard.sendCase);//警综案件数据
        const { device } = payload as { device: DeviceType };

        if (helper.isNullOrUndefinedOrEmptyString(sendCase?.CaseName)) {
            message.warn(`${caseText ?? '案件'}名称为空，请确认平台数据完整`);
            return;
        }
        if (helper.isNullOrUndefinedOrEmptyString(sendCase?.OwnerName)) {
            message.warn('姓名为空，请确认平台数据完整');
            return;
        }

        try {
            const [hasCase]: CCaseInfo[] = yield call([helper, 'caseNameExist'], sendCase.CaseName);

            if (hasCase === undefined) {
                //# 库中无重名案件，从警综平台数据中创建案件入库
                let filePaths: string[] | undefined = yield ipcRenderer.invoke('open-dialog-sync', {
                    title: `选择${caseText ?? '案件'}存储目录`,
                    properties: ['openDirectory']
                });
                if (filePaths === undefined || filePaths.length === 0) { return; }
                const newCase = new CCaseInfo();
                newCase._id = helper.newId();
                newCase.caseType = CaseType.GuangZhou;
                newCase.m_strCaseName = `${sendCase.CaseName!.replace(
                    /_/g,
                    ''
                )}_${helper.timestamp()}`;
                newCase.m_strCasePath = filePaths[0];
                newCase.m_strCheckUnitName = sendCase.deptName;
                newCase.handleCaseNo = sendCase.CaseID;
                newCase.handleCaseName = sendCase.CaseName;
                newCase.handleCaseType = sendCase.CaseType;
                // newCase.handleOfficerNo = sendCase.ObjectID;
                newCase.securityCaseNo = sendCase.CaseID;
                newCase.securityCaseName = sendCase.CaseName;
                newCase.securityCaseType = sendCase.CaseType;
                newCase.officerName = sendCase.OfficerName;
                newCase.officerNo = sendCase.OfficerID;
                newCase.m_Applist = helper.getAllApps(parseApps.fetch) as CParseApp[];
                newCase.tokenAppList = [];
                newCase.sdCard = false;
                newCase.m_bIsAutoParse = true;
                newCase.generateBcp = true;
                newCase.attachment = AttachmentType.Nothing;
                newCase.hasReport = false;
                newCase.isAi = false;
                newCase.isDel = false;
                yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.Case, newCase);
                let exist: boolean = yield call([helper, 'existFile'], path.join(newCase.m_strCasePath, newCase.m_strCaseName));
                if (!exist) {
                    //案件路径不存在，创建之
                    mkdirSync(path.join(newCase.m_strCasePath, newCase.m_strCaseName));
                }
                //写Case.json
                yield fork([helper, 'writeCaseJson'], path.join(newCase.m_strCasePath, newCase.m_strCaseName), newCase);
                //从警综平台数据中创建设备采集数据
                const fetchData = new FetchData();
                fetchData.caseName = newCase.m_strCaseName;
                fetchData.caseId = newCase._id;
                fetchData.casePath = filePaths[0];
                fetchData.sdCard = newCase.sdCard;
                fetchData.isAuto = newCase.m_bIsAutoParse;
                fetchData.hasReport = newCase.hasReport;
                fetchData.unitName = sendCase.deptName;
                fetchData.mobileName = `${device.model ?? ''}_${helper.timestamp(device.usb)}`;
                fetchData.mobileNo = '';
                fetchData.mobileNumber = sendCase.Phone ?? '';
                fetchData.mobileHolder = sendCase.OwnerName ?? '';
                fetchData.note = sendCase.Desc ?? '';
                fetchData.credential = sendCase.IdentityID ?? '';
                fetchData.serial = device.serial ?? '';
                fetchData.mode = DataMode.GuangZhou;
                fetchData.appList = newCase.m_Applist ?? [];
                fetchData.cloudAppList = [];
                //开始采集
                yield put({
                    type: 'startFetch', payload: {
                        deviceData: device,
                        fetchData
                    }
                });
            } else {
                //# 已存在案件，从警综平台推送案件中取数据，直接走采集流程
                const fetchData = new FetchData();
                fetchData.caseId = hasCase._id;
                fetchData.caseName = hasCase.m_strCaseName;
                fetchData.casePath = hasCase.m_strCasePath;
                fetchData.sdCard = hasCase.sdCard;
                fetchData.isAuto = hasCase.m_bIsAutoParse;
                fetchData.hasReport = hasCase.hasReport;
                fetchData.unitName = sendCase.deptName;
                fetchData.mobileName = `${device.model}_${helper.timestamp(device.usb)}`;
                fetchData.mobileNo = '';
                fetchData.mobileNumber = sendCase.Phone ?? '';
                fetchData.mobileHolder = sendCase.OwnerName ?? '';
                fetchData.handleOfficerNo = sendCase.ObjectID ?? '';
                fetchData.note = sendCase.Desc ?? '';
                fetchData.credential = sendCase.IdentityID ?? '';
                fetchData.serial = device.serial ?? '';
                fetchData.mode = DataMode.GuangZhou;
                fetchData.appList = hasCase.m_Applist ?? [];
                fetchData.cloudAppList = [];
                //开始采集
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
    },
    /**
     * 添加或更新采集人员（存在编号则更新）
     * @param {Officer} payload 采集人员
     */
    *saveOrUpdateOfficer({ payload }: AnyAction, { call, fork }: EffectsCommandMap) {

        const { no, name } = payload as Officer;

        try {
            const prev: Officer | null = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Officer, { no });
            if (prev === null) {
                //insert
                yield fork([ipcRenderer, 'invoke'], 'db-insert', TableName.Officer, payload);
            } else {
                //update
                const next = {
                    ...prev,
                    name
                };
                yield fork([ipcRenderer, 'invoke'], 'db-update', TableName.Officer, { no }, next);
            }
        } catch (error) {
            logger.error(`保存采集人员失败 @model/dashboard/Device/effects/saveOrUpdateOfficer: ${error.message}`);
        }
    }
};