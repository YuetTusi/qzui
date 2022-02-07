import { Model } from 'dva';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { Officer } from '@src/schema/Officer';
import reducers from './reducers';
import effects from './effects';

interface CaseEditState {
    /**
     * 当前编辑的案件对象
     */
    data: CCaseInfo;
    /**
     * 采集人员列表
     */
    officerList: Officer[];
    /**
     * 保存状态
     */
    saving: boolean;
}

/**
 * 案件编辑model
 */
let model: Model = {
    namespace: 'caseEdit',
    state: {
        data: {},
        officerList: [],
        saving: false
    },
    reducers,
    effects
}

export { CaseEditState };
export default model;
