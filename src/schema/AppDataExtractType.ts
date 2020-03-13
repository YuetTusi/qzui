/**
 * 采集方式枚举
 * 用此类型分类用户提示
 */
export enum AppDataExtractType {
    /**
     * 获取数据成功
     */
    EXTRACT_SUCCESS = 0,
    /**
     * 降级备份
     */
    ANDROID_DOWNGRADE_BACKUP = 1,
    /**
     * VIVO直传
     */
    VIVO_EASYSHARE = 2,
    /**
     * 自带备份
     */
    BACKUP_PHONE = 3,
    /**
     * WiFi 搬家
     */
    BACKUP_WIFI = 4,
    /**
     * 华为PC备份
     */
    HUAWEI_BACKUP_PC = 5,
    /**
     * 苹果iTunes备份
     */
    BACKUP_IDEVICE = 6,
    /**
     * 三星助手
     */
    SAMSUNG_SMARTSWITCH = 7,
    /**
     * 华为Hisuite备份
     */
    BACKUP_HISUITE
}