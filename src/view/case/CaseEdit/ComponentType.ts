import { StoreComponent } from "@src/type/model";
import { StoreState } from "@src/model/case/CaseEdit/CaseEdit";
import { FormComponentProps } from "antd/lib/form";
import { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import { CParseApp } from "@src/schema/CParseApp";
import { TokenApp } from "@src/schema/TokenApp";

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

/**
 * CaseEdit组件上下文
 */
interface Context {
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
     * 有无附件Change事件
     */
    attachmentChange: (e: CheckboxChangeEvent) => void;
    /**
     * 是否删除原数据Change事件
     */
    isDelChange: (e: CheckboxChangeEvent) => void;
    /**
     *  是否进行AI分析Change事件
     */
    isAiChange: (e: CheckboxChangeEvent) => void;
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
     * 采集人员初始化值
     */
    getOfficerInitVal: (officerNo: string) => void;
    /**
     * 解析App选择Handle
     */
    parseAppSelectHandle: (nodes: CParseApp[]) => void;
    /**
     * 云取证App选择Handle
     */
    tokenAppSelectHandle: (nodes: TokenApp[]) => void;
}

export { Context, Prop, State };