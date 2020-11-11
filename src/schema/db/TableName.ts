/**
 * NeDB集合（表名）枚举
 */
enum TableName {
    /**
     * 采集日志表
     */
    FetchLog = 'FetchLog',
    /**
     * 解析日志表
     */
    ParseLog = 'ParseLog',
    /**
     * 案件表
     */
    Case = 'Case',
    /**
     * 设备（手机）表
     */
    Device = 'Device',
    /**
     * 检验员
     */
    Officer = 'Officer',
    /**
     * 点验设备数据
     */
    CheckData = 'CheckData',
    /**
     * BCP历史记录表
     */
    CreateBcpHistory = 'CreateBcpHistory',
    /**
     * 单位表（部队版本）
     */
    ArmyUnit = 'ArmyUnit',
    /**
     * FTP配置
     */
    FtpConfig = 'FtpConfig'
}

export { TableName };