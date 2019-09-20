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
     * 自带备份
     */
    BACKUP_PHONE,
    /**
     * WIFI 搬家
     */
    BACKUP_WIFI,
    /**
     * Hisuite 备份
     */
    HUAWEI_BACKUP_PC,

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