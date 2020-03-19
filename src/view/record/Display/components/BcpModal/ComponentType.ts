import { Moment } from 'moment';
import { FormComponentProps } from 'antd/lib/form';
import { StoreComponent } from '@src/type/model';
import { StoreState } from '@src/model/record/Display/BcpModal';
import { CBCPInfo } from '@src/schema/CBCPInfo';


interface Prop extends FormComponentProps, StoreComponent {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 手机绝对路径
     */
    phonePath: string;
    /**
     * 仓库模型
     */
    bcpModal: StoreState;
    /**
     * 确定Handle
     */
    okHandle: (arg0: CBCPInfo) => void;
    /**
     * 取消Handle
     */
    cancelHandle: () => void;
}

interface State {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 手机绝对路径
     */
    phonePath: string;
}

/**
 * 表单类型
 */
interface FormValue {
    /**
     * BCP检验单位编号
     */
    BCPCheckOrganizationID: string;
    /**
     * BCP检验单位名称
     */
    BCPCheckOrganizationName: string;
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

export { Prop, State, FormValue };