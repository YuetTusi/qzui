import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { EffectsCommandMap, Model } from 'dva';
import { TableName } from '@src/schema/db/TableName';
import { DeviceType } from '@src/schema/socket/DeviceType';
import CCaseInfo from '@src/schema/CCaseInfo';

interface BatchExportReportModalState {

    /**
     * 批量导出的案件id
     */
    devices: DeviceType[],
    /**
     * 当前案件名称
     */
    caseName: string
}

let model: Model = {
    namespace: 'batchExportReportModal',
    state: {
        devices: []
    },
    reducers: {
        setCaseName(state: BatchExportReportModalState, { payload }: AnyAction) {
            state.caseName = payload;
            return state;
        },
        setDevices(state: BatchExportReportModalState, { payload }: AnyAction) {
            // console.log(payload);
            state.devices = payload;
            return state;
        }
    },
    effects: {
        *queryDevicesByCaseId({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {

            try {
                const [caseData, devices]: [CCaseInfo, DeviceType[]] = yield all([
                    call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: payload }),
                    call([ipcRenderer, 'invoke'], 'db-find', TableName.Device, { caseId: payload })
                ]);
                yield put({ type: 'setCaseName', payload: caseData.m_strCaseName });
                yield put({ type: 'setDevices', payload: devices });
            } catch (error) {

            }
        }
    }
};

export { BatchExportReportModalState };
export default model;