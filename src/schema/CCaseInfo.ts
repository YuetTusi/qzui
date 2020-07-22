import { CParseApp } from './CParseApp';
import { BaseEntity } from './db/BaseEntity';
import { DeviceType } from './socket/DeviceType';

/**
 * 案件结构体（维护时）
 */
class CCaseInfo extends BaseEntity {
    /**
     * 案件名称
     */
    public m_strCaseName: string;
    /**
     * 案件存储位置
     */
    public m_strCasePath: string;
    /**
     * 检验员姓名
     */
    public checkerName: string;
    /**
     * 检验员编号
     */
    public checkerNo: string;
    /**
     * 网安部门案件编号
     */
    public m_strCaseNo: string;
    /**
     * 网安部门案件类别
     */
    public m_strCaseType: string;
    /**
     * 网安部门案件名称
     */
    public m_strBCPCaseName: string;
    /**
     * 执法办案系统案件编号
     */
    public m_strGaCaseNo: string;
    /**
     * 执法办案系统案件类别
     */
    public m_strGaCaseType: string;
    /**
     * 执法办案系统案件名称
     */
    public m_strGaCaseName: string;
    /**
     * 执法办案人员编号/检材持有人编号
     */
    public m_strGaCasePersonNum: string;
    /**
     * 是否手动勾选App
     */
    public chooiseApp: boolean;
    /**
     * 是否自动解析
     */
    public m_bIsAutoParse: boolean;
    /**
     * 是否生成BCP
     */
    public m_bIsGenerateBCP: boolean;
    /**
     * 是否包含附件
     */
    public m_bIsAttachment: boolean;
    /**
     * App列表
     */
    public m_Applist: CParseApp[];
    /**
     * 送检单位
     */
    public m_strDstCheckUnitName: string;
    /**
     * 检验单位
     */
    public m_strCheckUnitName: string;
    /**
     * 采集设备列表
     */
    public devices: DeviceType[];

    constructor(props: any = {}) {
        super();
        this.m_strCaseName = props.m_strCaseName || '';
        this.m_strCasePath = props.m_strCasePath || '';
        this.checkerName = props.checkerName || '';
        this.checkerNo = props.checkerNo || '';
        this.m_strCaseNo = props.m_strCaseNo || '';
        this.m_strCaseType = props.m_strCaseType || '';
        this.m_strBCPCaseName = props.m_strBCPCaseName || '';
        this.m_strGaCaseNo = props.m_strGaCaseNo || '';
        this.m_strGaCaseType = props.m_strGaCaseType || '';
        this.m_strGaCaseName = props.m_strGaCaseName || '';
        this.m_strGaCasePersonNum = props.m_strGaCasePersonNum || '';
        this.chooiseApp = props.chooiseApp || false;
        this.m_bIsAutoParse = props.m_bIsAutoParse || false;
        this.m_bIsGenerateBCP = props.m_bIsGenerateBCP || false;
        this.m_bIsAttachment = props.m_bIsAttachment || false;
        this.m_Applist = props.m_Applist || [];
        this.m_strDstCheckUnitName = props.m_strDstCheckUnitName || '';
        this.m_strCheckUnitName = props.m_strCheckUnitName || '';
        this.devices = props.devices || [];
    }
}

export { CCaseInfo };
export default CCaseInfo;