import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { BcpModelState } from "@src/model/record/Display/Bcp";

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库State
     */
    bcp: BcpModelState;
};

export { Prop }