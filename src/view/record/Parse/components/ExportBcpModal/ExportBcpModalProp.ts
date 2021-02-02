import { ExportBcpModalStore } from "@src/model/record/Display/ExportBcpModal";
import CCaseInfo from "@src/schema/CCaseInfo";
import { StoreComponent } from "@src/type/model";

interface Prop extends StoreComponent {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 案件id
     */
    caseData: CCaseInfo,
    /**
     * 导出BCP handle
     * @param bcpList 导出BCP文件列表
     * @param destination 导出目录
     */
    okHandle: (bcpList: string[], destination: string) => void,
    /**
     * 取消handle
     */
    cancelHandle: () => void,
    /**
     * 仓库State
     */
    exportBcpModal: ExportBcpModalStore
}

export { Prop }