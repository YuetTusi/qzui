import { StoreComponent } from "@src/type/model";
import { ExtendMyPhoneInfo, StoreModel } from "@src/model/case/CaseData/InnerPhoneTable";

interface Prop extends StoreComponent {
    /**
     * 案件路径
     */
    caseName: string;
    /**
     * 删除Handle
     * @param arg0 组件属性
     * @param arg1 案件路径
     */
    delHandle: (arg0: ExtendMyPhoneInfo, args1: string) => void;
    /**
     * 仓库模型
     */
    innerPhoneTable: StoreModel;
}

export { Prop };