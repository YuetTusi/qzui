import { remote } from "electron";
import { AnyAction } from 'redux';
import { EffectsCommandMap } from "dva";
import logger from "@src/utils/log";
import { DbInstance } from '@src/type/model';
import DeviceType from "@src/schema/socket/DeviceType";
import { TableName } from "@src/schema/db/TableName";
import { CloudLog } from '@src/schema/socket/CloudLog';
import { OneCloudApp } from ".";

const getDb = remote.getGlobal('getDb');

export default {
    /**
     * 保存云取证日志
     * @param {number} payload.usb 序号
     */
    *saveCloudLog({ payload }: AnyAction, { fork, select }: EffectsCommandMap) {
        const db: DbInstance<CloudLog> = getDb(TableName.CloudLog);
        const { usb } = payload as { usb: number };
        const { device, cloudCodeModal } = yield select((state: any) => ({ device: state.device, cloudCodeModal: state.cloudCodeModal }));

        const currentDevice = device.deviceList[usb - 1] as DeviceType;
        const currentMessage = cloudCodeModal.devices[usb - 1] as { apps: OneCloudApp[] };
        // console.log(currentDevice);
        // console.log(currentMessage);
        if (currentDevice) {
            try {
                yield fork([db, 'insert'], {
                    mobileName: currentDevice.mobileName,
                    mobileHolder: currentDevice.mobileHolder,
                    mobileNumber: currentDevice.mobileNumber,
                    mobileNo: currentDevice.mobileNo ?? '',
                    fetchTime: new Date(),
                    note: currentDevice.note ?? '',
                    apps: currentMessage?.apps ?? []
                });
                console.info('写入成功');
            } catch (error) {
                logger.error(`写入云取证日志失败 @components/CloudCodeModal/effects/saveCloudLog:${error.message}`);
            }
            // db.insert({})
        } else {
            logger.warn(`未写入云取证日志，设备数据为空 usb:#${usb}`);
        }
    }
};