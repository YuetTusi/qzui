import miBackup from '@src/components/StepModal/steps/mi/backup';
import oppoBackup from '@src/components/StepModal/steps/oppo/backup';
import oppoWiFi from '@src/components/StepModal/steps/oppo/wifi';
import vivoBackup from '@src/components/StepModal/steps/vivo/backup';
import meizuBackup from '@src/components/StepModal/steps/meizu/backup';
import huaweiBackup from '@src/components/StepModal/steps/huawei/backup';
import huaweiBackupPc from '@src/components/StepModal/steps/huawei/backuppc';
import huaweiWifi from '@src/components/StepModal/steps/huawei/wifi';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { BrandName } from '@src/schema/BrandName';

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
 */
export function steps(type: AppDataExtractType | null, brand: BrandName): OneStepData[] {

    switch (type) {
        //自带备份
        case AppDataExtractType.BACKUP_PHONE:
            switch (brand) {
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
            switch (brand) {
                case BrandName.HUAWEI:
                    return huaweiWifi;
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
        default:
            return [];
    }
}