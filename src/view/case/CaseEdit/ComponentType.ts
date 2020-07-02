import { StoreComponent } from "@src/type/model";
import { StoreState } from "@src/model/case/CaseEdit/CaseEdit";
import { FormComponentProps } from "antd/lib/form";

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库对象
     */
    caseEdit: StoreState;
}

interface State {
    /**
     * 单位名历史记录
     */
    historyUnitNames: string[];
    /**
     * 当前编辑的案件名称
     */
    titleCaseName: string;
}

export { Prop, State };