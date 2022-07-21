import { AnyAction } from 'redux';
import { EffectsCommandMap, Model } from 'dva';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { ipcRenderer } from 'electron';

interface HitResultStoreState {
    /**
     * 设备数据
     */
    deviceData?: DeviceType
}


let model: Model = {
    namespace: 'hitResult',
    state: {
        deviceData: undefined,
        pieChartData: undefined
    },
    reducers: {
        setDeviceData(state: HitResultStoreState, { payload }: AnyAction) {
            state.deviceData = payload
            return state;
        }
    },
    effects: {
        /**
         * 按设备id查数据库记录
         * @param {string} payload 设备id
         */
        *queryDeviceById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            try {
                let deviceData: DeviceType = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Device, { id: payload });
                // const deviceData: DeviceType = yield call([db, 'findOne'], { id: payload });
                yield put({ type: 'setDeviceData', payload: deviceData });

            } catch (error) {

            }
        }
    }
};

export { HitResultStoreState };
export default model;