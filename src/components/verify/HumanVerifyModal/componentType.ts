import { StoreComponent } from "@src/type/model";
import { HumanVerifyStoreState } from "@src/model/components/Verify";

/**
 * 属性
 */
interface Prop extends StoreComponent {
    /**
     * 仓库state
     */
    humanVerify: HumanVerifyStoreState;
}

export { Prop };