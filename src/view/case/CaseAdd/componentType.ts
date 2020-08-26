import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { ICategory } from "@src/components/AppList/IApps";
import { StoreState } from "@src/model/case/CaseAdd/CaseAdd";

interface Prop extends StoreComponent, FormComponentProps {
    caseAdd: StoreState;
}
interface State {
    apps: Array<ICategory>; //App列表数据
    chooiseApp: boolean;    //开启/关闭选择App
    autoParse: boolean;     //是否自动解析
    generateBcp: boolean;   //生成BCP
    disableGenerateBcp: boolean;    //禁用勾选BCP
    attachment: boolean;    //是否有附件
    disableAttachment: boolean;//禁用勾选附件
    historyUnitNames: string[]; //localStore中存储的单位名
}

/**
 * 表单数据类型
 */
interface FormValue {
    /**
     * 案件名称
     */
    currentCaseName: string;
    /**
     * 案件存储路径
     */
    m_strCasePath: string;
    /**
     * 检验单位
     */
    checkUnitName: string;
    /**
     * 采集人员编号
     */
    officerNo: string;
    /**
     * 网安部门案件编号
     */
    securityCaseNo: string;
    /**
     * 网安部门案件类别
     */
    securityCaseType: string;
    /**
     * 网安部门案件名称
     */
    securityCaseName: string;
    /**
     * 执法办案系统案件编号
     */
    handleCaseNo: string;
    /**
     * 执法办案系统案件类别
     */
    handleCaseType: string;
    /**
     * 执法办案系统案件名称
     */
    handleCaseName: string;
    /**
     * 执法办案人员编号/检材持有人编号
     */
    handleOfficerNo: string;
}

export { Prop, State, FormValue };