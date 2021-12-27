import { ipcRenderer } from "electron";
import { AnyAction } from 'redux';
import { EffectsCommandMap } from "dva";
import logger from "@utils/log";
import { caseStore } from "@src/utils/localStore";
import { StateTree } from '@src/type/model';
import { TableName } from "@src/schema/db/TableName";
import DeviceType from "@src/schema/socket/DeviceType";
import { CloudAppMessages } from "@src/schema/socket/CloudAppMessages";
import { helper } from "@src/utils/helper";

export default {
    /**
     * 保存云取证日志
     * @param {number} payload.usb 序号
     */
    *saveCloudLog({ payload }: AnyAction, { fork, select }: EffectsCommandMap) {
        const { usb } = payload as { usb: number };
        const { device, cloudCodeModal } = yield select((state: StateTree) => ({
            device: state.device,
            cloudCodeModal: state.cloudCodeModal
        }));
        const currentDevice = device.deviceList[usb - 1] as DeviceType;
        const currentMessage = cloudCodeModal.devices[usb - 1] as { apps: CloudAppMessages[] };
        const { caseName, spareName } = caseStore.get(usb);

        if (currentDevice) {
            try {
                yield fork([ipcRenderer, 'invoke'], 'db-insert', TableName.CloudLog, {
                    mobileName: currentDevice.mobileName,
                    mobileHolder: currentDevice.mobileHolder,
                    mobileNumber: currentDevice.mobileNumber,
                    mobileNo: currentDevice.mobileNo ?? '',
                    fetchTime: new Date(),
                    note: currentDevice.note ?? '',
                    apps: currentMessage?.apps ?? [],
                    caseName: helper.isNullOrUndefinedOrEmptyString(spareName) ? caseName.split('_')[0] : spareName
                });
            } catch (error) {
                logger.error(`写入云取证日志失败 @components/CloudCodeModal/effects/saveCloudLog:${error.message}`);
            }
        } else {
            logger.warn(`未写入云取证日志，设备数据为空 usb:#${usb}`);
        }
    }
};