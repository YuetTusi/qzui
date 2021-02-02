import { Model } from 'dva';
import { AnyAction } from 'redux';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import DeviceType from '@src/schema/socket/DeviceType';

interface ExportBcpModalStore {
    /**
     * 正在导出状态
     */
    exporting: boolean,
    /**
     * 是否是批量导出
     * * 批量读取exportBcpCase下所有设备的BCP文件
     * * 非批量读取exportBcpDevice下的BCP文件
     */
    isBatch: boolean,
    /**
     * 案件数据
     */
    exportBcpCase: CCaseInfo,
    /**
     * 设备数据
     */
    exportBcpDevice: DeviceType
}

let model: Model = {
    namespace: 'exportBcpModal',
    state: {
        exporting: false,
        isBatch: false,
        exportBcpCase: {},
        exportBcpDevice: {}
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
         * 设置是否批量导出
         * @param {boolean} payload 是否是批量
         */
        setIsBatch(state: ExportBcpModalStore, { payload }: AnyAction) {
            state.isBatch = payload;
            return state;
        },
        /**
         * 批量导出的案件数据
         * @param {CCaseInfo} payload 案件
         */
        setExportBcpCase(state: ExportBcpModalStore, { payload }: AnyAction) {
            state.exportBcpCase = payload;
            return state;
        },
        /**
        * 导出BCP的设备
        * @param {DeviceType} payload 设备
        */
        setExportBcpDevice(state: ExportBcpModalStore, { payload }: AnyAction) {
            state.exportBcpDevice = payload;
            return state;
        }
    }
}

export { ExportBcpModalStore };
export default model;