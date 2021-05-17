import { StoreComponent } from "@src/type/model";
import { BatchExportReportModalState } from "@src/model/record/Display/BatchExportReportModal";
import { ZTreeNode } from "../ExportReportModal/componentTypes";

interface Prop extends StoreComponent {

    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 仓库State
     */
    batchExportReportModal: BatchExportReportModalState,
    /**
     * 关闭handle
     */
    cancelHandle: () => void
}

/**
 * 导出任务（一个）
 */
interface ReportExportTask {

    /**
     * 报告源路径
     */
    reportRoot: string,
    /**
     * 导出位置
     */
    saveTarget: string,
    /**
     * 报告名称
     */
    reportName: string,
    /**
     * 导出的节点（全部）
     */
    tree: ZTreeNode[],
    /**
     * 数据JSON文件
     */
    files: string[],
    /**
     * 附件JSON文件
     */
    attaches: string[]
}

export { Prop, ReportExportTask };