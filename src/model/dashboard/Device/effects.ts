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
import { FetchState } from "@src/schema/socket/DeviceState";
import CommandType, { SocketType } from "@src/schema/socket/Command";
import { ProgressType } from "@src/schema/socket/FetchRecord";
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
                    caseData);
            }
        } catch (error) {
            console.log(error);
            logger.error({ message: `设备数据入库失败 @model/dashboard/Device/effects/saveDeviceToCase: ${error.message}` });
        }
    },
    /**
     * 保存采集日志
     * @param payload.usb USB序号
     * @param payload.state 采集结果（是有错还是成功）FetchLogState枚举
     */
    *saveFetchLog({ payload }: AnyAction, { call, select }: EffectsCommandMap) {
        const { usb, state } = payload as { usb: number, state: FetchState };
        try {
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
        } catch (error) {
            logger.error(`向LiveModal发送数据失败 @model/dashboard/Device/effects/saveFetchLog: ${error.message}`);
            console.log(error);
        }
    },
    /**
     * 开始采集
     * @param payload.deviceData 为当前设备数据(DeviceType)
     * @param payload.fetchData 为当前采集输入数据(FetchData)
     */
    *startFetch({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
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
        //采集时把必要的数据更新到deviceList中
        yield put({
            type: 'setDeviceToList', payload: {
                usb: deviceData.usb,
                tipType: TipType.Nothing,
                tipMsg: '',
                tipImage: undefined,
                fetchState: FetchState.Fetching,
                tipRequired: undefined,
                manufacturer: deviceData.manufacturer,
                model: deviceData.model,
                system: deviceData.system,
                mobileName: fetchData.mobileName,
                mobileNo: fetchData.mobileNo,
                mobileHolder: fetchData.mobileHolder,
                note: fetchData.note,
                fetchRecord: [],
                isStopping: false
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
        rec.id = uuid();

        yield put({
            type: 'saveDeviceToCase', payload: {
                id: fetchData.caseId,
                data: rec
            }
        });
        console.log({
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
    }
};