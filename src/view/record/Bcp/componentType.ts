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
     * 检才编号(采集单位码+时间)
     */
    bcpNo1: string;
    /**
     * 检材编号（前3位）
     */
    bcpNo2: string;
    /**
     * 检材编号（后4位）
     */
    bcpNo3: string;
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

/**
 * BCP生成配置信息
 */
interface BcpConf {
    /**
     * 制造商
     */
    manufacturer: string;
    /**
     * 厂商组织机构代码
     */
    security_software_orgcode: string;
    /**
     * 设备名称
     */
    materials_name: string;
    /**
     * 设备型号
     */
    materials_model: string;
    /**
     * 硬件版本号
     */
    materials_hardware_version: string;
    /**
     * 软件版本号
     */
    materials_software_version: string;
    /**
     * 设备序列号
     */
    materials_serial: string;
    /**
     * 采集点IP
     */
    ip_address: string;
}

export { Prop, UnitRecord, FormValue, BcpConf }