import { StoreComponent } from "@src/type/model";
import { StoreModel } from "@src/model/record/Display/Parse";

/**
 * 属性
 */
interface Prop extends StoreComponent {
    /**
     * 仓库State
     */
    parse: StoreModel;
}

/**
 * 状态
 */
interface State {
    /**
     * 显示进度框
     */
    progressModalVisible: boolean,
    /**
     * 显示编辑框
     */
    editModalVisible: boolean,
    /**
     * 显示导出报告框
     */
    exportReportModalVisible: boolean,
    /**
     * 展开的rowKeys
     */
    expendRowKeys: string[] | number[]
}

export { Prop, State };