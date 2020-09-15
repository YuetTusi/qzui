import DeviceType from "@src/schema/socket/DeviceType";
import CCaseInfo from "@src/schema/CCaseInfo";

interface Prop {
    /**
     * 案件数据
     */
    caseData: CCaseInfo;
    /**
     * 页号
     */
    pageIndex?: number;
    /**
     * 父表格行是否展开
     */
    expended: boolean;
    /**
     * 开始解析Handle
     */
    startParseHandle: (device: DeviceType) => void;
    /**
     * 详情Handle
     */
    progressHandle: (device: DeviceType) => void;
    /**
     * 跳转到BCP页
     */
    toBcpHandle: (device: DeviceType, caseId: string) => void;
    /**
     * 批量生成Handle
     */
    // batchHandle: (devices: DeviceType[], caseId: string) => void;
    /**
     * 翻页Change
     */
    pageChange: (current: number, caseId: string) => void;
    /**
     * 编辑handle
     */
    editHandle: (device: DeviceType) => void;
}

export { Prop };