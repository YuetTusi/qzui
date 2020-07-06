import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import message from 'antd/lib/message';
import Db from '@utils/db';
import { helper } from '@utils/helper';
import { TableName } from "@src/schema/db/TableName";
import CCaseInfo from "@src/schema/CCaseInfo";
import DeviceType from "@src/schema/socket/DeviceType";

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
    }
};