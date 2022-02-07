import { Model } from "dva";
import { Officer } from '@src/schema/Officer';
import reducers from './reducers';
import effects from './effects';

interface CaseAddState {
    /**
     * 保存状态
     */
    saving: boolean;
    /**
     * 采集人员Options
     */
    officerList: Officer[];
}

let model: Model = {
    namespace: "caseAdd",
    state: {
        saving: false,
        officerList: []
    },
    reducers,
    effects
}

export { CaseAddState };
export default model;