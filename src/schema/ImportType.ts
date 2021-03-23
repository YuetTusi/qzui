/**
 * 第三方导入数据类型
 */
export const importTypes = [
    { name: '华为Hisuite备份', value: 'hisuite' },
    { name: '苹果iTunes备份', value: 'ios' },
    { name: 'VIVO自备份', value: 'vivo_easyshare' },
    { name: 'OPPO自备份', value: 'oppo_backup' },
]

/**
 * 导入方式枚举
 */
export enum ImportTypes {
    /**
     * 华为Hisuite备份
     */
    Hisuite = 'hisuite',
    /**
     * 苹果iTunes备份
     */
    IOS = 'ios',
    /**
     * VIVO自备份
     */
    VivoEasyshare = 'vivo_easyshare',
    /**
     * OPPO自备份
     */
    OppoBackup = 'oppo_backup',
    /**
     * 小米自备份
     */
    XiaomiBackup = 'xiaomi_backup'
}