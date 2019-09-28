import miBackup from '@src/components/StepModal/steps/mi/backup';
import huaweiBackup from '@src/components/StepModal/steps/huawei/backup'
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { BrandName } from '@src/schema/BrandName';

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
 * @param type 枚举类型
 * @param brand 手机品牌名
 */
export function steps(type: number, brand: string): OneStepData[] {
    // console.log(type);
    // console.log(brand);
    switch (type) {
        //自带备份
        case AppDataExtractType.BACKUP_PHONE:
            switch (brand) {
                case BrandName.HUAWEI:
                    return huaweiBackup;
            }
            return miBackup;
        case AppDataExtractType.HUAWEI_BACKUP_PC:
            return huaweiBackup;
        default:
            return [];
    }
}