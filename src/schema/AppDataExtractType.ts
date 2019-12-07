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
    /**
     * 三星助手
     */
    SAMSUNG_SMARTSWITCH
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
        case AppDataExtractType.SAMSUNG_SMARTSWITCH:
            return '三星助手';
        default:
            return '其他';
    }
}