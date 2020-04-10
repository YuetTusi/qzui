import miBackup from '@src/components/StepModal/steps/mi/backup';
import oppoBackup from '@src/components/StepModal/steps/oppo/backup';
import oppoWiFi from '@src/components/StepModal/steps/oppo/wifi';
import oppoWiFiConfirm from '@src/components/StepModal/steps/oppo/wifiConfirm';
import vivoBackup from '@src/components/StepModal/steps/vivo/backup';
import meizuBackup from '@src/components/StepModal/steps/meizu/backup';
import huaweiBackup from '@src/components/StepModal/steps/huawei/backup';
import huaweiBackupPc from '@src/components/StepModal/steps/huawei/backuppc';
import huaweiWifi from '@src/components/StepModal/steps/huawei/wifi';
import tzsafeApk from '@src/components/StepModal/steps/apk/TZSafe/apk';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { BrandName } from '@src/schema/BrandName';
import FetchResposeUI from '@src/schema/FetchResposeUI';
import { ApkType } from '@src/schema/ApkType';

/**
 * 提示框步骤类型
 */
interface OneStepData {
    //步骤标题
    title: string,
    //描述
    description?: string,
    //内容
    content: string | JSX.Element
}

/**
 * 得到提示步骤数据
 * @param type 提示类型枚举
 * @param brand 手机品牌枚举
 * @param fetchResponseUI 用户采集响应码
 */
export function steps(type: AppDataExtractType | null, brand: BrandName, fetchResponseUI: number): OneStepData[] {

    switch (type) {
        //自带备份
        case AppDataExtractType.BACKUP_PHONE:
            switch (brand.toLowerCase()) {
                case BrandName.HUAWEI:
                    return huaweiBackup;
                case BrandName.MEIZU:
                    return meizuBackup;
                case BrandName.MI:
                    return miBackup;
                case BrandName.OPPO:
                    return oppoBackup;
                case BrandName.VIVO:
                    return vivoBackup;
                default:
                    return [];
            }
        //华为Hisuite备份
        case AppDataExtractType.HUAWEI_BACKUP_PC:
            return huaweiBackupPc;
        //WiFi搬家
        case AppDataExtractType.BACKUP_WIFI:
            switch (fetchResponseUI) {
                case FetchResposeUI.OPPO_FETCH_CONFIRM:
                    return oppoWiFiConfirm;
                default:
                    return oppoWiFi;
            }
        //降级备份
        case AppDataExtractType.ANDROID_DOWNGRADE_BACKUP:
            return [];
        //苹果iTunes备份
        case AppDataExtractType.BACKUP_IDEVICE:
            return [];
        //三星助手备份
        case AppDataExtractType.SAMSUNG_SMARTSWITCH:
            return [];
        //华为Hisuite备份
        case AppDataExtractType.BACKUP_HISUITE:
            return huaweiWifi;
        default:
            return [];
    }
}

/**
 * 手动安装APK步骤
 * @param type APK类型
 */
export function apk(type: ApkType): OneStepData[] {
    switch (type) {
        case ApkType.AGENT_APK:
            return tzsafeApk;
        default:
            return [];
    }
}