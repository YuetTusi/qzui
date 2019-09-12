import miBackup from '@src/components/StepModal/steps/huawei/backup'
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
        case AppDataExtractType.MIUI_BACKUP_PHONE:
            return miBackup;
        default:
            return [];
    }
}