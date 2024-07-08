import { AnyAction } from 'redux';
import { PaperworkModalState } from '.';

export default {

    /**
     * 案件树数据
     * @param state TreeNodeProps[]
     */
    setCaseTree(state: PaperworkModalState, { payload }: AnyAction) {
        state.caseTree = payload;
        return state;
    },
    /**
     * 展开/折叠Key
     * @param state Key[]
     */
    setExpandedKeys(state: PaperworkModalState, { payload }: AnyAction) {
        state.expandedKeys = payload;
        return state;
    },
    /**
     * 设置选中案件数量
     * @param state number
     */
    setSelectedCaseCount(state: PaperworkModalState, { payload }: AnyAction) {
        state.selectedCaseCount = payload;
        return state;
    },
    /**
     * 设置选中案件名称
     * @param state string
     */
    setSelectedCaseName(state: PaperworkModalState, { payload }: AnyAction) {
        state.selectedCaseName = payload;
        return state;
    },
    /**
     * 勾选的设备
     * @param state DeviceType[]
     */
    setCheckedDevices(state: PaperworkModalState, { payload }: AnyAction) {
        state.checkedDevices = payload;
        return state;
    },
    /**
     * 第2步表单值
     */
    setTwoFormValue(state: PaperworkModalState, { payload }: AnyAction) {
        state.twoFormValue = payload;
        return state;
    },
    /**
     * 第3步表单值
     */
    setThreeFormValue(state: PaperworkModalState, { payload }: AnyAction) {
        state.threeFormValue = payload;
        return state;
    },
    /**
     * 第4步表单值
     */
    setFourFormValue(state: PaperworkModalState, { payload }: AnyAction) {
        state.fourFormValue = payload;
        return state;
    },
    /**
     * 清空第3步表单
     */
    clearThreeFormValue(state: PaperworkModalState, { }: AnyAction) {
        state.threeFormValue = [];
        return state;
    },
    /**
     * 清空勾选设备
     */
    clearCheckedDevices(state: PaperworkModalState, { }: AnyAction) {
        state.checkedDevices = [];
        return state;
    },
    /**
     * 读取中
     */
    setLoading(state: PaperworkModalState, { payload }: AnyAction) {

        state.loading = payload;
        return state;
    },
    /**
     * 重置所有值
     */
    resetValue(state: PaperworkModalState, { }: AnyAction) {
        state.expandedKeys = [];
        state.selectedCaseCount = 0;
        state.selectedCaseName = '';
        state.checkedDevices = [];
        state.twoFormValue = {} as any;
        state.threeFormValue = [];
        state.fourFormValue = {} as any;
        state.loading = false;
        return state;
    }
};