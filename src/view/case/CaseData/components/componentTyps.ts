import { StoreComponent } from "@src/type/model";
import { ExtendMyPhoneInfo, StoreModel } from "@src/model/case/CaseData/InnerPhoneTable";
import DeviceType from "@src/schema/socket/DeviceType";

interface Prop extends StoreComponent {
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
    /**
     * 仓库模型
     */
    innerPhoneTable: StoreModel;
}

export { Prop };