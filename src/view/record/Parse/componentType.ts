import { StoreComponent } from "@src/type/model";
import { StoreModel } from "@src/model/record/Display/Parse";
import { ExportBcpModalStore } from "@src/model/record/Display/ExportBcpModal";
import { InnerPhoneTableState } from "@src/model/record/Display/InnerPhoneTable";

/**
 * 属性
 */
interface Prop extends StoreComponent {
    /**
     * 仓库State
     */
    parse: StoreModel,
    /**
     * 导出BCP弹框State
     */
    exportBcpModal: ExportBcpModalStore,
    /**
     * 手机子表格State
     */
    innerPhoneTable: InnerPhoneTableState;
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
     * 显示批量导出BCP框
     */
    exportBcpModalVisible: boolean,
    /**
     * 显示批量导出报告框
     */
    batchExportReportModalVisible: boolean,
    /**
     * 展开的rowKeys
     */
    expendRowKeys: string[] | number[]
}

/**
 * this上下文
 */
interface Context {
    /**
     * 属性
     */
    props: Prop,
    /**
     * 显示/隐藏批量导出BCP弹框
     * @param visible 显示/隐藏
     */
    exportBcpModalVisibleChange: (visible: boolean) => void,
    /**
     * 显示/隐藏批量导出报告框
     * @param visible 显示/隐藏
     */
    batchExportReportModalVisibleChange: (visible: boolean) => void
}

export { Prop, State, Context };