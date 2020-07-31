import { FetchState, ParseState } from './DeviceState';
import { BaseEntity } from '../db/BaseEntity';
import TipType, { ReturnButton } from './TipType';
import GuideImage from './GuideImage';

/**
 * 手机设备类型
 */
class DeviceType extends BaseEntity {
    /**
     * 唯一标识uuid
     */
    id?: string;
    /**
     * 所属案件的id
     */
    caseId?: string;
    /**
     * 命令
     */
    cmd?: string;
    /**
     * 类型(区分socket分类)
     */
    type?: string;
    /**
     * 制造商
     */
    manufacturer?: string;
    /**
     * 手机型号
     */
    model?: string;
    /**
     * 系统类型
     */
    system?: string;
    /**
     * USB序号
     */
    usb?: number;
    /**
     * 采集状态
     */
    fetchState?: FetchState;
    /**
     * 解析状态
     */
    parseState?: ParseState;
    /**
     * 检验员
     */
    checker?: string;
    /**
     * 检验员编号
     */
    checkerNo?: string;
    /**
     * 手机名称
     */
    mobileName?: string;
    /**
     * 手机编号
     */
    mobileNo?: string;
    /**
     * 手机持有人
     */
    mobileHolder?: string;
    /**
     * 采集方式
     */
    fetchType?: string[];
    /**
     * 采集时间
     */
    fetchTime?: Date;
    /**
     * 解析时间
     */
    parseTime?: Date;
    /**
     * 是否正在停止中
     */
    isStopping?: boolean = false;
    /**
     * 备注
     */
    note?: string;
    /**
     * 采集完整路径
     */
    phonePath?: string;
    /**
     * 消息类型（为Nothing时为无消息）
     */
    tipType?: TipType = TipType.Nothing;
    /**
     * 消息标题
     */
    tipTitle?: string;
    /**
     * 消息文字内容
     */
    tipContent?: string;
    /**
     * 消息引导图
     */
    tipImage?: GuideImage;
    /**
     * 是按钮
     */
    tipYesButton?: ReturnButton;
    /**
     * 否按钮
     */
    tipNoButton?: ReturnButton;
}

export { DeviceType };
export default DeviceType;