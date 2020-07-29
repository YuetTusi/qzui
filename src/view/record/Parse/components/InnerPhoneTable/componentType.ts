import DeviceType from "@src/schema/socket/DeviceType";

interface Prop {
    /**
     * 案件id
     */
    caseId: string;
    /**
     * 解析App分类id
     */
    appIds: string[];
    /**
     * 数据
     */
    data: DeviceType[];
    /**
     * 开始解析Handle
     */
    startParseHandle: (caseId: string, appIds: string[], device: DeviceType) => void;
}

export { Prop };