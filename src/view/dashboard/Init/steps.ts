import miBackup from '@src/components/StepModal/steps/mi/backup';
import oppoBackup from '@src/components/StepModal/steps/oppo/backup';
import vivoBackup from '@src/components/StepModal/steps/vivo/backup';
import meizuBackup from '@src/components/StepModal/steps/meizu/develop';
import huaweiBackupPc from '@src/components/StepModal/steps/huawei/backuppc'
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
    content: any
}

/**
 * 得到提示步骤数据
 * @param type 提示类型枚举
 * @param brand 手机品牌枚举
 */
export function steps(type: number, brand: string): OneStepData[] {
    // console.log(type);
    // console.log(brand);
    switch (type) {
        //自带备份
        case AppDataExtractType.BACKUP_PHONE:
            switch (brand) {
                case BrandName.OPPO:
                    return oppoBackup;
                case BrandName.MEIZU:
                    return meizuBackup;
                case BrandName.MI:
                    return miBackup;
                default:
                    return [];
            }
        //华为Hisuite
        case AppDataExtractType.HUAWEI_BACKUP_PC:
            return huaweiBackupPc;
        //WiFi搬家
        case AppDataExtractType.BACKUP_WIFI:
            return [];
        //降级备份
        case AppDataExtractType.ANDROID_DOWNGRADE_BACKUP:
            return [];
        default:
            return [];
    }
}