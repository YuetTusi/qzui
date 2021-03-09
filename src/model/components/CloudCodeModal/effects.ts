import { remote } from "electron";
import { AnyAction } from 'redux';
import { EffectsCommandMap } from "dva";
import logger from "@utils/log";
import { DbInstance } from '@src/type/model';
import { TableName } from "@src/schema/db/TableName";
import DeviceType from "@src/schema/socket/DeviceType";
import { CloudLog } from '@src/schema/socket/CloudLog';
import { CloudAppMessages } from "@src/schema/socket/CloudAppMessages";

const getDb = remote.getGlobal('getDb');

export default {
    /**
     * 保存云取证日志
     * @param {number} payload.usb 序号
     */
    *saveCloudLog({ payload }: AnyAction, { fork, select }: EffectsCommandMap) {
        const db: DbInstance<CloudLog> = getDb(TableName.CloudLog);
        const { usb } = payload as { usb: number };
        const { device, cloudCodeModal } = yield select((state: any) => ({
            device: state.device,
            cloudCodeModal: state.cloudCodeModal
        }));
        const currentDevice = device.deviceList[usb - 1] as DeviceType;
        const currentMessage = cloudCodeModal.devices[usb - 1] as { apps: CloudAppMessages[] };

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
            } catch (error) {
                logger.error(`写入云取证日志失败 @components/CloudCodeModal/effects/saveCloudLog:${error.message}`);
            }
        } else {
            logger.warn(`未写入云取证日志，设备数据为空 usb:#${usb}`);
        }
    }
};