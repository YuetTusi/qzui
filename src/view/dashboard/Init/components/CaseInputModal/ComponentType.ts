import { Dispatch } from 'redux';
import { Moment } from 'moment';
import { AppDataExtractType } from "@src/schema/AppDataExtractType";
import { FormComponentProps } from "antd/lib/form";
import { StoreData } from '@src/model/dashboard/Init/CaseInputModal';
import CFetchDataInfo from "@src/schema/CFetchDataInfo";

/**
 * 表单对象
 */
interface FormValue {
    /**
     * 案件
     */
    case: string;
    /**
     * 检验员
     */
    police: string;
    /**
     * 检验单位
     */
    unit: string;
    /**
     * 手机名称
     */
    phoneName: string;
    /**
     * 设备编号
     */
    deviceNumber: string;
    /**
     * 手机持有人
     */
    user: string;
    /**
     * 检验员(BCP为false时)
     */
    officerInput: string;
    /**
     * 检验单位(BCP为false时)
     */
    unitInput: string;
    /**
     * 检验员(BCP为true时)
     */
    officerSelect: string;
    /**
     * 检验单位(BCP为true时)
     */
    unitList: string;
    /**
     * 采集方式
     */
    collectType: AppDataExtractType;
    //---以下内容为生成BCP所必填数据
    /**
     * BCP检验单位编号
     */
    BCPCheckOrganizationID: string;
    /**
     * 检材持有人证件类型
     */
    CertificateType: string;
    /**
     * 检材持有人证件编号
     */
    CertificateCode: string;
    /**
     * 检材持有人证件签发机关
     */
    CertificateIssueUnit: string;
    /**
     * 检材持有人证件生效日期
     */
    CertificateEffectDate: Moment;
    /**
     * 检材持有人证件失效日期
     */
    CertificateInvalidDate: Moment;
    /**
     * 检材持有人性别
     */
    SexCode: string;
    /**
     * 民族
     */
    Nation: string;
    /**
     * 检材持有人生日
     */
    Birthday: Moment;
    /**
     * 检材持有人证件头像
     */
    UserPhoto: string;
    /**
     * 检材持有人住址
     */
    Address: string;
}

/**
 * 属性类型
 */
interface Prop extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 手机品牌名称
     */
    piBrand: string;
    /**
     * 手机型号
     */
    piModel: string;
    /**
     * 序列号
     */
    piSerialNumber: string;
    /**
     * 物理USB端口
     */
    piLocationID: string;
    /**
     * 设备用户列表
     */
    piUserlist: number[];
    dispatch?: Dispatch<any>;
    caseInputModal?: StoreData;
    //保存回调
    saveHandle?: (arg0: CFetchDataInfo) => void;
    //取消回调
    cancelHandle?: () => void;
}

/**
 * 状态类型
 */
interface State {
    /**
     * 是否可见
     */
    caseInputVisible: boolean;
    /**
     * 所选案件是否生成BCP
     */
    isBcp: boolean;
    /**
     * 是否打开BCP面板
     */
    isOpenBcpPanel: boolean;
}

export { State, Prop, FormValue };