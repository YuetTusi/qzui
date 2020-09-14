import path from 'path';
import { ipcRenderer } from "electron";
import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import moment from 'moment';
import uuid from 'uuid/v4';
import { send } from "@src/service/tcpServer";
import Db from '@utils/db';
import logger from "@src/utils/log";
import { caseStore } from "@src/utils/localStore";
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
import { StoreState } from './index';
import { ParseEnd } from '@src/schema/socket/ParseLog';
import ParseLogEntity from '@src/schema/socket/ParseLog';

/**
 * 副作用
 */
export default {
    /**
     * 查询案件数据是否为空
     */
    *queryEmptyCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const db = new Db<CCaseInfo>(TableName.Case);
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

        const db = new Db<DeviceType>(TableName.Device);
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
     * # 要将数据库中`解析状态`改为采集异常
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
        const db = new Db<DeviceType>(TableName.Device);
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
        const deviceDb = new Db<DeviceType>(TableName.Device);
        const parseLogDb = new Db<ParseLogEntity>(TableName.ParseLog);
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
    *startFetch({ payload }: AnyAction, { put }: EffectsCommandMap) {
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
                isAuto: fetchData.isAuto,
                mode: fetchData.mode
            }
        });
    },
    /**
     * 开始解析
     * @param {number} payload USB序号
     */
    *startParse({ payload }: AnyAction, { select, call, put }: EffectsCommandMap) {

        const db = new Db<CCaseInfo>(TableName.Case);

        let device: StoreState = yield select((state: any) => state.device);
        let current = device.deviceList.find((item) => item?.usb == payload);

        try {
            let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: current?.caseId });
            if (current && caseData.m_bIsAutoParse) {
                //# 数据存在且是`自动解析`
                console.log(`开始解析(StartParse): ${JSON.stringify({
                    type: SocketType.Parse,
                    cmd: CommandType.StartParse,
                    msg: {
                        phonePath: current.phonePath,
                        caseId: caseData._id,
                        deviceId: current.id
                    }
                })}`);
                logger.info(`开始解析(StartParse):${JSON.stringify({
                    phonePath: current.phonePath,
                    caseId: caseData._id,
                    deviceId: current.id
                })}`);
                //# 通知parse开始解析
                send(SocketType.Parse, {
                    type: SocketType.Parse,
                    cmd: CommandType.StartParse,
                    msg: {
                        phonePath: current.phonePath,
                        caseId: caseData._id,
                        deviceId: current.id
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
    }
};