import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import message from 'antd/lib/message';
import Db from '@utils/db';
import { helper } from '@utils/helper';
import { TableName } from "@src/schema/db/TableName";
import CCaseInfo from "@src/schema/CCaseInfo";
import DeviceType from "@src/schema/socket/DeviceType";
import { caseStore } from "@src/utils/localStore";
import { StoreState } from './index';
import FetchLog from "@src/schema/socket/FetchLog";
import logger from "@src/utils/log";

/**
 * 副作用
 */
export default {
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
            message.success('保存设备数据成功');
        } catch (error) {
            console.log(error);
            message.error('保存设备数据失败');
        }
    },
    /**
     * 保存采集日志
     * @param payload.usb USB序号
     * @param payload.state 采集结果（是有错还是成功）FetchLogState枚举
     */
    *saveFetchLog({ payload }: AnyAction, { call, select }: EffectsCommandMap) {
        const db = new Db<FetchLog>(TableName.FetchLog);
        const { usb } = payload;

        try {
            let device: StoreState = yield select((state: any) => state.device);
            let current = device.deviceList[usb - 1]; //当前采集完毕的手机
            if (current) {
                //console.log(device.deviceList[usb - 1]);
                let log = new FetchLog();
                log.fetchTime = new Date();
                log.mobileHolder = current.mobileHolder;
                log.mobileName = current.mobileName;
                log.mobileNo = current.mobileNo;
                log.state = payload.state;
                //todo: 最终在仓库数据中取真实的采集详情入库，此处为mock数据
                log.record = current.fetchRecord;
                yield call([db, 'insert'], log);
            }
        } catch (error) {
            message.error('存储采集日志失败');
            logger.error({ message: `存储采集日志失败 @model/dashboard/Device/effects/saveFetchLog: ${error.message}` });
            console.log(error);
        }
    }
};