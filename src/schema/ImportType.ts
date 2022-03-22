/**
 * 导入方式枚举
 */
export enum ImportTypes {
    /**
     * 华为Hisuite备份
     */
    Hisuite = 'hisuite',
    /**
     * 华为OTG备份
     */
    HuaweiOTG = 'huawei_otg',
    /**
     * 苹果iTunes备份
     */
    IOS = 'ios',
    /**
     * VIVO PC备份
     */
    VivoPcBackup = 'vivo_pc_backup',
    /**
     * OPPO自备份
     */
    OppoBackup = 'oppo_backup',
    /**
     * 小米自备份
     */
    XiaomiBackup = 'xiaomi_backup',
    /**
     * 安卓数据
     */
    AndroidData = 'android_data',
    /**
     * 苹果镜像导入
     */
    IOSMirror = 'ios_mirror'
}