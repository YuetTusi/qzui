import { AnyAction } from 'redux';
import CCaseInfo from '@src/schema/CCaseInfo';
import { Model } from 'dva';

interface ExportBcpModalStore {
    /**
     * 正在导出状态
     */
    exporting: boolean,
    /**
     * 导出BCP的案件数据
     */
    exportBcpCase: CCaseInfo
}

let model: Model = {
    namespace: 'exportBcpModal',
    state: {
        exporting: false,
        exportBcpCase: {}
    },
    reducers: {
        /**
         * 设置正在导出状态
         * @param {boolean} payload 
         */
        setExporting(state: ExportBcpModalStore, { payload }: AnyAction) {
            state.exporting = payload;
            return state;
        },
        /**
         * 设置导出BCP的案件id
         * @param {CCaseInfo} payload 案件
         */
        setExportBcpCase(state: ExportBcpModalStore, { payload }: AnyAction) {
            state.exportBcpCase = payload;
            return state;
        }
    }
}

export { ExportBcpModalStore };
export default model;