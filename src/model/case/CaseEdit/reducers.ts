import { AnyAction } from 'redux';
import { CaseEditState } from ".";

export default {
    /**
     * 获取应用数据
     */
    setAnalysisApp(state: CaseEditState, { payload }: AnyAction) {
        state.data.analysisApp = payload;
        return state;
    },
    /**
     * 是否拉取SD卡
     */
    setSdCard(state: CaseEditState, { payload }: AnyAction) {
        state.data.sdCard = payload;
        return state;
    },
    /**
     * 是否生成报告
     */
    setHasReport(state: CaseEditState, { payload }: AnyAction) {
        state.data.hasReport = payload;
        return state;
    },
    /**
     * 设置是否自动解析值（true或false）
     */
    setAutoParse(state: CaseEditState, { payload }: AnyAction) {
        state.data.m_bIsAutoParse = payload;
        return state;
    },
    /**
     * 设置是否生成BCP
     * @param {boolean} payload 
     */
    setGenerateBcp(state: CaseEditState, { payload }: AnyAction) {
        state.data.generateBcp = payload;
        return state;
    },
    /**
     * 设置是否包含附件
     */
    setAttachment(state: CaseEditState, { payload }: AnyAction) {
        state.data.attachment = payload;
        return state;
    },
    /**
     * 设置是否删除原数据
     */
    setIsDel(state: CaseEditState, { payload }: AnyAction) {
        state.data.isDel = payload;
        return state;
    },
    /**
     * 设置是否进行AI分析
     */
    setIsAi(state: CaseEditState, { payload }: AnyAction) {
        state.data.isAi = payload;
        return state;
    },
    /**
     * 图片违规分析
     */
    setIsPhotoAnalysis(state: CaseEditState, { payload }: AnyAction) {
        state.data.isPhotoAnalysis = payload;
        return state;
    },
    /**
     * 更新采集人员Options
     * @param {OfficerEntity[]} payload; 
     */
    setOfficerList(state: CaseEditState, { payload }: AnyAction) {
        state.officerList = payload;
        return state;
    },
    setData(state: CaseEditState, { payload }: AnyAction) {
        state.data = payload;
        return state;
    },
    setSaving(state: CaseEditState, { payload }: AnyAction) {
        state.saving = payload;
        return state;
    }
}