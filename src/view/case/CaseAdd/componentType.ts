import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { ICategory } from "@src/components/AppList/IApps";
import { StoreState } from "@src/model/case/CaseAdd/CaseAdd";

interface Prop extends StoreComponent, FormComponentProps {
    caseAdd: StoreState;
}
interface State {
    apps: Array<ICategory>;         //App列表数据
    chooiseApp: boolean;            //开启/关闭选择App
    autoParse: boolean;             //是否自动解析
    isDisableBCP: boolean;          //是否禁用BCP
    isShowBCPInput: boolean;        //是否显示BCP输入区
    isDisableAttachment: boolean;   //是否禁用附件
    bcp: boolean;                   //是否生成BCP
    attachment: boolean;            //是否带附件
    historyUnitNames: string[];      //localStore中存储的单位名
}

export { Prop, State };