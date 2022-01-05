import moment from 'moment';
import { helper } from '@utils/helper';

/**
 * 验证案件/设备目录名称合法性
 * @param fullName 案件/设备名称
 */
export function validName(fullName: string) {

    if (fullName.includes('_')) {
        const [, timestamp] = fullName.split('_');
        return moment(timestamp, 'YYYYMMDDHHmmss', true).isValid();
    } else {
        return false;
    }

}

/**
 * 导入案件数据
 * @param casePath 导入案件路径
 */
export async function getDataJson(casePath: string[]) {

    const tasks = casePath.map(i => helper.glob('**/*(Case|Device).json', i));

    const json = await Promise.all(tasks);

    console.log(json.flat());
}