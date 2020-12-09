import { AnyAction } from 'redux';
import { Model } from 'dva';

interface InnerPhoneTableState {
    /**
     * 是否正在导出报告
     */
    exporting: boolean
}

let model: Model = {
    namespace: 'innerPhoneTable',
    state: {
        exporting: false
    },
    reducers: {
        /**
         * 设置解析详情消息
         * @param {boolean} payload 是否正在导出
         */
        setExporting(state: InnerPhoneTableState, { payload }: AnyAction) {
            state.exporting = payload;
            return state;
        }
    }
};

export { InnerPhoneTableState };
export default model;