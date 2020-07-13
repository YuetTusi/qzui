import { Moment } from 'moment';
import FetchData from "@src/schema/socket/FetchData";
import { StoreState } from '@src/model/dashboard/Device/CaseInputModal';
import { FormComponentProps } from 'antd/lib/form';
import { StoreComponent } from '@src/type/model';
import DeviceType from '@src/schema/socket/DeviceType';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';


export interface Prop extends FormComponentProps, StoreComponent {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 当前手机设备数据
     */
    device?: DeviceType;
    /**
     * 保存回调
     */
    saveHandle?: (arg0: FetchData) => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
    /**
     * 仓库数据
     */
    caseInputModal?: StoreState;
};

/**
 * 表单
 */
export interface FormValue {
    /**
     * 案件
     */
    case: string;
    /**
     * 检验员
     */
    m_strThirdCheckerName: string;
    /**
     * 检验编号
     */
    m_strThirdCheckerID: string;
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
     * 手机编号
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
     * 目的检验单位(BCP为true时)
     */
    dstUnitList: string;
    /**
     * 目的检验单位(BCP为false时)
     */
    dstUnitInput: string;
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