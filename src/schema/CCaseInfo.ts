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
     * 是否手动勾选App
     */
    public chooiseApp: boolean;
    /**
     * 是否自动解析
     */
    public m_bIsAutoParse: boolean;
    /**
     * App列表
     */
    public m_Applist: CParseApp[];
    /**
     * 检验单位
     */
    public m_strCheckUnitName: string;

    constructor(props: any = {}) {
        super();
        this.m_strCaseName = props.m_strCaseName || '';
        this.m_strCasePath = props.m_strCasePath || '';
        this.chooiseApp = props.chooiseApp || false;
        this.m_bIsAutoParse = props.m_bIsAutoParse || false;
        this.m_Applist = props.m_Applist || [];
        this.m_strCheckUnitName = props.m_strCheckUnitName || '';
    }
}

export { CCaseInfo };
export default CCaseInfo;