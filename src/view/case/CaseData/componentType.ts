import { FormComponentProps } from "antd/lib/form";
import { StoreComponent } from "@src/type/model";
import { CaseDataState } from "@src/model/case/CaseData";
import { DataMode } from "@src/schema/DataMode";
import CCaseInfo from "@src/schema/CCaseInfo";

/**
 * Prop
 */
interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 案件State
     */
    caseData: CaseDataState;
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
interface CaseJson extends CCaseInfo {
    /**
     * 案件名称
     */
    caseName: string,
    /**
     * 送检单位
     */
    checkUnitName: string
}

export { Prop, State, CaseJson, DeviceJson };