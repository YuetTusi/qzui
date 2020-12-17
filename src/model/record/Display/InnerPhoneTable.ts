import { AnyAction } from 'redux';
import { Model } from 'dva';

interface InnerPhoneTableState {
    /**
     * 正在生成报告的设备id
     */
    creatingDeviceId: string[],
    /**
     * 正在导出报告的设备id
     * *为null表示无导出任务
     */
    exportingDeviceId: string | null,
}

let model: Model = {
    namespace: 'innerPhoneTable',
    state: {
        creatingDeviceId: [],
        exportingDeviceId: null
    },
    reducers: {
        /**
         * 添加正在生成报告的设备id
         * @param {string} payload 正在生成报告的deviceId
         */
        addCreatingDeviceId(state: InnerPhoneTableState, { payload }: AnyAction) {
            state.creatingDeviceId.push(payload);
            return state;
        },
        /**
         * 删除正在生成报告的设备id
         * @param {string} payload 生成报告完成的deviceId
         */
        removeCreatingDeviceId(state: InnerPhoneTableState, { payload }: AnyAction) {
            state.creatingDeviceId = state.creatingDeviceId.filter(i => i !== payload);
            return state;
        },
        /**
         * 设置正在导出报告的设备id
         * @param {string|null} payload 正在导出报告的deviceId
         */
        setExportingDeviceId(state: InnerPhoneTableState, { payload }: AnyAction) {
            state.exportingDeviceId = payload;
            return state;
        }
    }
};

export { InnerPhoneTableState };
export default model;