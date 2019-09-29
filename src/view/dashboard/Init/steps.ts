import miBackup from '@src/components/StepModal/steps/mi/backup';
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
                case BrandName.HUAWEI:
                    return huaweiBackupPc;
            }
            return miBackup;
        case AppDataExtractType.HUAWEI_BACKUP_PC:
            return huaweiBackupPc;
        default:
            return [];
    }
}