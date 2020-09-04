
/**
 * 采集模式
 */
enum FetchMode {
    /**
     * 标准版本（正常采集流程）
     */
    Normal,
    /**
     * 点验版本
     * 此版本提供给特殊单位使用，采集时用`序列号`保存到数据库
     * 再次采集若有历史记录则直接采集，免去用户手输信息
     */
    Check
}

/**
 * 采集对象
 */
class FetchData {
    /**
     * 案件名称
     */
    caseName?: string;
    /**
     * 案件id
     */
    caseId?: string;
    /**
     * 案件存储路径（用户所选绝对路径）
     */
    casePath?: string;
    /**
     * 解析APP包名
     */
    appList?: string[];
    /**
     * 是否自动解析
     */
    isAuto?: boolean;
    /**
     * 手机名称
     */
    mobileName?: string;
    /**
     * 手机编号
     */
    mobileNo?: string;
    /**
     * 手机持有人（点验版为`姓名`，共用此字段）
     */
    mobileHolder?: string;
    /**
     * 证件号码
     */
    credential?: string;
    /**
     * 备注（点验版为`设备手机号`，共用此字段）
     */
    note?: string;
    /**
     * 检验单位
     */
    unitName?: string;
    /**
     * 序列号
     */
    serial?: string;
    /**
     * 模式（0为标准版本,1为点验版本）
     */
    mode?: FetchMode;
}

export { FetchData, FetchMode };
export default FetchData;