
import { Model } from "dva";
import reducers from './reducers';
import effects from './effects';

const PAGE_SIZE = 10;

/**
 * 仓库Model
 */
interface CaseDataState {
    /**
     * 总记录数
     */
    total: number;
    /**
     * 当前页
     */
    current: number;
    /**
     * 页尺寸
     */
    pageSize: number;
    /**
     * 案件数据
     */
    caseData: any[];
    /**
     * 加载中
     */
    loading: boolean;
    /**
     * 当前快速点验的案件id，为null不显示二维码
     */
    checkCaseId: string | null;
}

/**
 * 案件信息Model
 */
let model: Model = {
    namespace: 'caseData',
    state: {
        //案件表格数据
        caseData: [],
        total: 0,
        current: 1,
        pageSize: PAGE_SIZE,
        loading: false,
        checkCaseId: null
    },
    reducers,
    effects
}

export { CaseDataState };
export default model;
