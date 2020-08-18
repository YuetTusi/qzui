import DeviceType from "@src/schema/socket/DeviceType";

interface Prop {
    /**
     * 案件id
     */
    caseId: string;
    /**
     * 数据
     */
    data: DeviceType[];
    /**
     * 页号
     */
    pageIndex?: number;
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
     * 删除Handle
     */
    delHandle: (device: DeviceType) => void;
    /**
     * 批量生成Handle
     */
    batchHandle: (devices: DeviceType[], caseId: string) => void;
    /**
     * 翻页Change
     */
    pageChange: (current: number, caseId: string) => void;
}

export { Prop };