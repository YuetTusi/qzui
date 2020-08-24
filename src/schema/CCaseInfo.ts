import { CParseApp } from './CParseApp';
import { BaseEntity } from './db/BaseEntity';

/**
 * 案件（维护时）
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
    public generateBcp: boolean;
    /**
     * App列表
     */
    public m_Applist: CParseApp[];
    /**
     * 检验单位
     */
    public m_strCheckUnitName: string;

    /**
     * 采集人员编号
     */
    public officerNo: string;
    /**
     * 网安部门案件编号
     */
    public securityCaseNo: string;
    /**
     * 网安部门案件类别
     */
    public securityCaseType: string;
    /**
     * 网安部门案件名称
     */
    public securityCaseName: string;
    /**
     * 执法办案系统案件编号
     */
    public handleCaseNo: string;
    /**
     * 执法办案系统案件类别
     */
    public handleCaseType: string;
    /**
     * 执法办案系统案件名称
     */
    public handleCaseName: string;
    /**
     * 执法办案人员编号/检材持有人编号
     */
    public handleOfficerNo: string;

    constructor(props: any = {}) {
        super();
        this.m_strCaseName = props.m_strCaseName || '';
        this.m_strCasePath = props.m_strCasePath || '';
        this.chooiseApp = props.chooiseApp || false;
        this.m_bIsAutoParse = props.m_bIsAutoParse || false;
        this.generateBcp = props.generateBcp || false;
        this.m_Applist = props.m_Applist || [];
        this.m_strCheckUnitName = props.m_strCheckUnitName || '';
        this.officerNo = props.officerNo || '';
        this.securityCaseNo = props.securityCaseNo || '';
        this.securityCaseType = props.securityCaseType || '';
        this.securityCaseName = props.securityCaseName || '';
        this.handleCaseNo = props.handleCaseNo || '';
        this.handleCaseType = props.handleCaseType || '';
        this.handleCaseName = props.handleCaseName || '';
        this.handleOfficerNo = props.handleOfficerNo || '';
    }
}

export { CCaseInfo };
export default CCaseInfo;