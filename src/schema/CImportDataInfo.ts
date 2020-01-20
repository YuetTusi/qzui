import CFetchDataInfo from './CFetchDataInfo';

/**
 * 第三方导入数据结构体
 */
class CImportDataInfo {

    /**
     * 数据所在路径
     */
    public m_strFileFolder?: string;
    /**
     * 手机品牌
     */
    public m_strPhoneBrand?: string;
    /**
     * 手机型号
     */
    public m_strPhoneModel?: string;

    /**
     * 案件结构体
     */
    public m_BaseInfo?: CFetchDataInfo;

    constructor(props: any = {}) {
        this.m_strFileFolder = props.m_strFileFolder || '';
        this.m_strPhoneBrand = props.m_strPhoneBrand || '';
        this.m_strPhoneModel = props.m_strPhoneModel || '';
        this.m_BaseInfo = props.m_BaseInfo || new CFetchDataInfo();
    }
}

export { CImportDataInfo };
export default CImportDataInfo;