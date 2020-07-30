import path from 'path';
import { ipcRenderer } from "electron";
import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
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
import { FetchState, ParseState } from "@src/schema/socket/DeviceState";
import CommandType, { SocketType } from "@src/schema/socket/Command";
import TipType from "@src/schema/socket/TipType";
import { StoreState } from './index';

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
     * @param payload.id 案件id
     * @param payload.data 设备数据(DeviceType)
     */
    *saveDeviceToCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

        const db = new Db<CCaseInfo>(TableName.Case);
        try {
            let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: payload.id });
            if (!helper.isNullOrUndefined(caseData.devices)) {
                caseData.devices.push(payload.data as DeviceType);
                yield call(
                    [db, 'update'],
                    { _id: payload.id },
                    caseData
                );
            }
        } catch (error) {
            console.log(error);
            logger.error(`设备数据入库失败 @model/dashboard/Device/effects/saveDeviceToCase: ${error.message}`);
        }
    },
    /**
     * 更新数据库解析状态
     * @param {string} payload.id 设备id
     * @param {string} payload.caseId 案件id
     * @param {ParseState} payload.parseState 解析状态
     */
    *updateParseState({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const { id, caseId, parseState } = payload;
        const db = new Db<CCaseInfo>(TableName.Case);
        try {
            let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: caseId });

            caseData.devices = caseData.devices.map(item => {
                if (item.id === id) {
                    item.parseState = parseState;
                }
                return item;
            });

            yield call([db, 'update'], { _id: caseId }, caseData);
        } catch (error) {
            logger.error(`更新解析状态入库失败 @model/dashboard/Device/effects/updateParseState: ${error.message}`);
        }
    },
    /**
     * 保存采集日志
     * @param payload.usb USB序号
     * @param payload.state 采集结果（是有错还是成功）FetchLogState枚举
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
     * 开始采集
     * @param payload.deviceData 为当前设备数据(DeviceType)
     * @param payload.fetchData 为当前采集输入数据(FetchData)
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

        //拼接手机完整路径
        let phonePath = path.join(fetchData.casePath!, fetchData.caseName!, fetchData.mobileHolder!, fetchData.mobileName!);

        //采集时把必要的数据更新到deviceList中
        yield put({
            type: 'setDeviceToList', payload: {
                usb: deviceData.usb,
                tipType: TipType.Nothing,
                tipMsg: '',
                tipImage: undefined,
                fetchState: FetchState.Fetching,
                parseState: ParseState.NotParse,
                tipRequired: undefined,
                manufacturer: deviceData.manufacturer,
                model: deviceData.model,
                system: deviceData.system,
                mobileName: fetchData.mobileName,
                mobileNo: fetchData.mobileNo,
                mobileHolder: fetchData.mobileHolder,
                note: fetchData.note,
                isStopping: false,
                phonePath,
                caseId: fetchData.caseId
            }
        });
        ipcRenderer.send('time', deviceData.usb! - 1, true);

        //NOTE:将设备数据入库
        let rec: DeviceType = { ...deviceData };
        rec.mobileHolder = fetchData.mobileHolder;
        rec.mobileNo = fetchData.mobileNo;
        rec.mobileName = fetchData.mobileName;
        rec.note = fetchData.note;
        rec.fetchTime = new Date();
        rec.phonePath = phonePath;
        rec.id = uuid();
        rec.caseId = fetchData.caseId;
        rec.parseState = ParseState.NotParse;

        yield put({
            type: 'saveDeviceToCase', payload: {
                id: fetchData.caseId,
                data: rec
            }
        });
        logger.info(`开始采集设备(StartFetch)：${JSON.stringify({
            usb: deviceData.usb!,
            caseName: fetchData.caseName,
            casePath: fetchData.casePath,
            mobileName: fetchData.mobileName,
            mobileHolder: fetchData.mobileHolder
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
                mobileHolder: fetchData.mobileHolder,
                fetchType: fetchData.fetchType
            }
        });
    },
    /**
     * 开始解析
     * @param payload USB序号
     */
    *startParse({ payload }: AnyAction, { select, call, put }: EffectsCommandMap) {

        const db = new Db<CCaseInfo>(TableName.Case);

        let device: StoreState = yield select((state: any) => state.device);
        let current = device.deviceList.find((item) => item?.usb == payload);

        try {
            let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: current?.caseId });

            if (current && caseData.m_bIsAutoParse) {
                let appIds = caseData.m_Applist.reduce((acc: string[], current: any) => {
                    acc.push(current.m_strID.toString());
                    return acc;
                }, []);
                console.log(`开始解析(StartParse): ${JSON.stringify({
                    type: SocketType.Parse,
                    cmd: CommandType.StartParse,
                    msg: {
                        phonePath: current.phonePath,
                        app: appIds
                    }
                })}`);
                //# 通知parse开始解析
                send(SocketType.Parse, {
                    type: SocketType.Parse,
                    cmd: CommandType.StartParse,
                    msg: {
                        phonePath: current.phonePath,
                        app: appIds
                    }
                });
                //# 更新数据记录为`解析中`状态
                yield put({
                    type: 'updateParseState', payload: {
                        id: current.id,
                        caseId: caseData._id,
                        parseState: ParseState.Parsing
                    }
                });
            }
        } catch (error) {
            logger.error(`解析前查询案件失败 @model/dashboard/Device/effects/startParse: ${error.message}`);
        }
    }
};