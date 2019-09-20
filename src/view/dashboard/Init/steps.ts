import miBackup from '@src/components/StepModal/steps/mi/backup';
import huaweiBackup from '@src/components/StepModal/steps/huawei/backup'
import { AppDataExtractType } from '@src/schema/AppDataExtractType';

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
 * @param type 
 */
export function steps(type: number): OneStepData[] {

    switch (type) {
        //自带备份
        case AppDataExtractType.BACKUP_PHONE:
            return miBackup;
        case AppDataExtractType.HUAWEI_BACKUP_PC:
            return huaweiBackup;
        default:
            return [];
    }
}