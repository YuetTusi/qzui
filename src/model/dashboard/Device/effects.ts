import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';

/**
 * 副作用
 */
export default {
    /**
     * 保存手机数据到案件下
     * @param payload.id 案件id
     * @param payload.data 设备数据(DeviceType)
     */
    *saveDeviceToCase({ payload }: AnyAction, { }: EffectsCommandMap) {
        console.log(payload);
        yield 1;
    }
};