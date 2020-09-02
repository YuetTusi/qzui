import { StoreComponent } from "@src/type/model";
import { CheckManageModelState } from "@src/model/settings/CheckManage/CheckManage";

/**
 * 属性
 */
interface Prop extends StoreComponent {
    /**
     * 仓库State
     */
    checkManage: CheckManageModelState,
}

export { Prop };