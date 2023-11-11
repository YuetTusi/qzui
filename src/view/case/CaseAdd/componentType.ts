import { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { CaseAddState } from "@src/model/case/CaseAdd";
import { CParseApp } from "@src/schema/CParseApp";
import { TokenApp } from "@src/schema/TokenApp";
import { AttachmentType } from "@src/schema/socket/BcpEntity";

interface Prop extends StoreComponent, FormComponentProps {
    /** 案件State */
    caseAdd: CaseAddState
}

interface State {
    /**
     * 获取应用数据
     */
    analysisApp: boolean,
    /** 是否拉SD卡 */
    sdCard: boolean,
    /** 是否生成报告 */
    hasReport: boolean,
    /** 是否自动解析 */
    autoParse: boolean,
    /** 生成BCP */
    generateBcp: boolean,
    /** 禁用勾选BCP */
    disableGenerateBcp: boolean,
    /** 是否删除原数据 */
    isDel: boolean,
    /** 是否进行AI分析 */
    isAi: boolean,
    /** 是否图片违规分析 */
    isPhotoAnalysis: boolean,
    /** localStore中存储的单位名 */
    historyUnitNames: string[]
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
     * 违规时段起
     */
    ruleFrom: number;
    /**
     * 违规时段止
     */
    ruleTo: number;
    /**
     * BCP附件类型
     */
    attachment: AttachmentType;
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
}

/**
 * CaseAdd组件上下文
 */
interface Context {
    /**
     * 获取应用数据Change
     */
    analysisAppChange: (e: CheckboxChangeEvent) => void;
    /**
     * 拉取SD卡Change事件
     */
    sdCardChange: (e: CheckboxChangeEvent) => void;
    /**
     * 生成报告Change事件
     */
    hasReportChange: (e: CheckboxChangeEvent) => void;
    /**
     * 自动解析Change事件
     */
    autoParseChange: (e: CheckboxChangeEvent) => void;
    /**
     * 生成BCPChange事件
     */
    generateBcpChange: (e: CheckboxChangeEvent) => void;
    /**
     * 是否删除原数据Change事件
     */
    isDelChange: (e: CheckboxChangeEvent) => void;
    /**
     * 是否进行AI分析Change事件
     */
    isAiChange: (e: CheckboxChangeEvent) => void;
    /**
     * 图片违规分析Change
     */
    isPhotoAnalysisChange: (e: CheckboxChangeEvent) => void;
    /**
     * 采集人员Change事件
     */
    officerChange: (
        value: string,
        option: React.ReactElement<any> | React.ReactElement<any>[]
    ) => void;
    /**
     * 绑定采集人员Options
     */
    bindOfficerOptions: () => JSX.Element;
    /**
     * 解析App选择Handle
     */
    parseAppSelectHandle: (nodes: CParseApp[]) => void;
    /**
     * Token云取证App选择Handle
     */
    tokenAppSelectHandle: (nodes: TokenApp[]) => void;
}


export { Context, Prop, State, FormValue };