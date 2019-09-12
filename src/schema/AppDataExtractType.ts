/**
 * 提示类型枚举
 * 用此类型分类用户提示
 */
export enum AppDataExtractType {
    /**
     * 获取数据成功
     */
    EXTRACT_SUCCESS,
    /**
     * 降级备份
     */
    ANDROID_DOWNGRADE_BACKUP,
    /**
     * VIVO直传
     */
    VIVO_EASYSHARE,
    /**
     * 小米自带备份
     */
    MIUI_BACKUP_PHONE,
    /**
     * 小米WIFI 搬家
     */
    MIUI_BACKUP_WIFI,
    /**
     * 华为自带备份
     */
    HUAWEI_BACKUP_PHONE,
    /**
     * Hisuite 备份
     */
    HUAWEI_BACKUP_PC,
    /**
     * 魅族自带备份
     */
    MEIZU_FLYME_BACKUP_PHONE,
    /**
     * OPPO自带备份
     */
    OPPO_BACKUP_PHONE,
    BACKUPFILE_UNKNOWN_FILE = 10000,
    /**
     * 所有应用全部打包为zip/AB，例如MEIZU备份和降级备份
     */
    BACKUPFILE_ANDROID_DIR_ZIPAB,
    /**
     * 每个应用独立打包为ZIP/AP。例如：XIAOMI，OPPO，VIVO
     */
    BACKUPFILE_ANDROID_APP_ZIPAB,
    /**
     * 已全部展开为SDCard目录结构形式，例如，huawei
     */
    BACKUPFILE_ANDROID_DIR_FOLDER
}