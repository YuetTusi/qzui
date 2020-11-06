import moment from 'moment';

/**
 * 验证案件/设备目录名称合法性
 * @param {string[]} url 案件路径
 */
export function validName(url: string[]) {

    return url.every(i => {

        if (i.includes('_')) {
            let pos = i.lastIndexOf('\\');
            const fullName = i.substring(pos + 1);
            const [name, timestamp] = fullName.split('_');
            return moment(timestamp, 'YYYYMMDDHHmmss', true).isValid();
        } else {
            return false;
        }
    });
}