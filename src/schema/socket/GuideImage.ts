import { defaultTo } from "lodash";

/**
 * 引导图枚举
 */
enum GuideImage {

    /**
     * 小米自备份
     */
    MiBackup = 'mi_backup',
    /**
     * 华为自备份
     */
    HuaweiBackup = 'huawei_backup',
    /**
     * 华为Hisuite备份
     */
    HuaweiHisuite = 'huawei_hisuite',
    /**
     * OPPO自备份
     */
    OppoBackup = 'oppo_backup',
    /**
     * OPPO WiFi采集
     */
    OppoWifi = 'oppo_wifi',
    /**
     * VIVO自备份
     */
    VivoBackup = 'vivo_backup',
    /**
     * 魅族自备份
     */
    MeizuBackup = 'meizu_backup',
    /**
     * 引导安装TZSafe.apk
     */
    InstallApk = 'install_apk'
}

export { GuideImage };
export default GuideImage;