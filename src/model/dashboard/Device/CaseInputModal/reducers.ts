import { AnyAction } from 'redux';

export default {
    /**
     * 更新案件下拉列表
     */
    setCaseList(state: any, { payload }: AnyAction) {
        return { ...state, caseList: payload };
    },
    /**
     * 更新检验员下拉列表
     */
    setOfficerList(state: any, { payload }: AnyAction) {
        return { ...state, officerList: payload };
    }
};