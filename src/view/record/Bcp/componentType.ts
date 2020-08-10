import { Moment } from 'moment';
import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { BcpModelState } from "@src/model/record/Display/Bcp";

/**
 * 属性
 */
interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库State
     */
    bcp: BcpModelState;
};


/**
 * 数据库查询结果
 */
interface UnitRecord {
    /**
     *  单位名称
     */
    PcsName: string;
    /**
     * 单位编号
     */
    PcsCode: string;
}

/**
 * 表单
 */
interface FormValue {
    /**
     * 有无附件
     */
    attachment: boolean;
    /**
     * 采集单位名称
     */
    unit: string;
    /**
     * 目的检验单位名称
     */
    dstUnit: string;
    /**
     * 采集人员
     */
    officer: string;
    /**
     * 持有人
     */
    mobileHolder: string;
    /**
     * 证件类型
     */
    credentialType: string;
    /**
     * 证件编号
     */
    credentialNo: string;
    /**
     * 证件生效日期
     */
    credentialEffectiveDate: Moment;
    /**
     * 证件失效日期
     */
    credentialExpireDate: Moment;
    /**
     * 证件签发机关
     */
    credentialOrg: string;
    /**
     * 认证头像
     */
    credentialAvatar: string;
    /**
     * 性别
     */
    gender: string;
    /**
     * 民族
     */
    nation: string;
    /**
     * 出生日期
     */
    birthday: Moment;
    /**
     * 住址
     */
    address: string;
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
     * 执法办案人员编号
     */
    handleOfficerNo: string;
}

export { Prop, UnitRecord, FormValue }