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
     * 生成BCP历史记录表
     */
    CreateBcpHistory = 'CreateBcpHistory'
}

export { TableName };