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
     * 删除Handle
     * @param arg0 设备对象DeviceType
     * @param arg1 案件id
     */
    delHandle: (arg0: DeviceType, arg1: string) => void;
}

export { Prop };