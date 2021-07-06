import { FormComponentProps } from "antd/lib/form";
import { StoreComponent } from "@src/type/model";
import { StoreModel } from "@src/model/case/CaseData/CaseData";
import { DataMode } from "@src/schema/DataMode";

/**
 * Prop
 */
interface Prop extends StoreComponent, FormComponentProps {
    caseData: StoreModel;
}

/**
 * State
 */
interface State {
    /**
     * 是否是admin访问
     */
    isAdmin: boolean,
    /**
     * 展开的rowKeys
     */
    expendRowKeys: string[] | number[]
}

/**
 * Device.json
 */
interface DeviceJson {
    /**
     * 持有人
     */
    mobileHolder: string,
    /**
     * 手机编号
     */
    mobileNo: string,
    /**
     * 手机名称
     */
    mobileName: string,
    /**
     * 备注
     */
    note: string,
    /**
     * 模式
     */
    mode: DataMode
}

/**
 * Case.json
 */
interface CaseJson {
    /**
     * 案件名称
     */
    caseName: string,
    /**
     * 送检单位
     */
    checkUnitName: string,
    /**
     * 取证人员
     */
    officerName: string,
    /**
     * 取证人员编号
     */
    officerNo: string,
    /**
     * 网安部门案件编号
     */
    securityCaseNo: string,
    /**
     * 网安部门案件类别
     */
    securityCaseType: string,
    /**
     * 网安部门案件名称
     */
    securityCaseName: string,
    /**
     * 执法办案系统案件编号
     */
    handleCaseNo: string,
    /**
     * 执法办案系统案件名称
     */
    handleCaseName: string,
    /**
     * 执法办案系统案件类别
     */
    handleCaseType: string
}

export { Prop, State, CaseJson, DeviceJson };