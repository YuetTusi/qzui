import { FormComponentProps } from 'antd/lib/form';
import { StoreComponent } from "@src/type/model";
import { CheckManageModelState } from "@src/model/settings/CheckManage/CheckManage";

/**
 * 属性
 */
interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库State
     */
    checkManage: CheckManageModelState,
}

export { Prop };