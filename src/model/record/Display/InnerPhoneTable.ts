import { AnyAction } from 'redux';
import { Model } from 'dva';

interface InnerPhoneTableState {
    /**
     * 正在导出报告的设备id
     * *为null表示无导出任务
     */
    exportingDeviceId: string | null,
}

let model: Model = {
    namespace: 'innerPhoneTable',
    state: {
        exportingDeviceId: null
    },
    reducers: {
        /**
         * 设置正在导出报告的设备id
         * @param {string|null} payload 是否正在导出
         */
        setExportingDeviceId(state: InnerPhoneTableState, { payload }: AnyAction) {
            state.exportingDeviceId = payload;
            return state;
        }
    }
};

export { InnerPhoneTableState };
export default model;