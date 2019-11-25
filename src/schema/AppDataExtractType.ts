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
     * 华为Hisuite备份
     */
    HUAWEI_BACKUP_PC,
    /**
     * 苹果iTunes备份
     */
    BACKUP_IDEVICE,

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

/**
 * 取得采集方式中文名
 */
export function getAppDataExtractType(type: number): string {

    switch (type) {
        case AppDataExtractType.EXTRACT_SUCCESS:
            return '获取数据成功';
        case AppDataExtractType.ANDROID_DOWNGRADE_BACKUP:
            return '降级备份';
        case AppDataExtractType.VIVO_EASYSHARE:
            return 'VIVO直传';
        case AppDataExtractType.BACKUP_PHONE:
            return '自带备份';
        case AppDataExtractType.HUAWEI_BACKUP_PC:
            return '华为Hisuite备份';
        case AppDataExtractType.BACKUP_IDEVICE:
            return '苹果iTunes备份';
        case AppDataExtractType.BACKUPFILE_UNKNOWN_FILE:
            return 'BACKUPFILE_UNKNOWN_FILE';
        case AppDataExtractType.BACKUPFILE_ANDROID_DIR_ZIPAB:
            return '所有应用全部打包为zip/AB';
        case AppDataExtractType.BACKUPFILE_ANDROID_APP_ZIPAB:
            return '每个应用独立打包为ZIP/AP';
        case AppDataExtractType.BACKUPFILE_ANDROID_DIR_FOLDER:
            return '已全部展开为SDCard目录结构形式';
        default:
            return '其他';
    }
}