import { AnyAction } from 'redux';
import { Model } from 'dva';

interface InnerPhoneTableState {
    /**
     * 是否正在导出报告
     */
    isExport: boolean,
    /**
     * 是否正在生成
     */
    isCreate: boolean
}

let model: Model = {
    namespace: 'innerPhoneTable',
    state: {
        exporting: false
    },
    reducers: {
        /**
         * 设置是否正在导出报告
         * @param {boolean} payload 是否正在导出
         */
        setExport(state: InnerPhoneTableState, { payload }: AnyAction) {
            state.isExport = payload;
            return state;
        },
        setCreate(state: InnerPhoneTableState, { payload }: AnyAction) {
            state.isCreate = payload;
            return state;
        }
    }
};

export { InnerPhoneTableState };
export default model;