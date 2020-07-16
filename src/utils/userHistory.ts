import localStore from './localStore';
import { helper } from './helper';

/**
 * 历史记录键名枚举
 */
enum HistoryKeys {
    /**
     * 检验单位
     */
    HISTORY_UNITNAME = 'HISTORY_UNITNAME',
    /**
     * 检验员
     */
    HISTORY_CHECKERNAME = 'HISTORY_CHECKERNAME',
    /**
     * 检验员编号
     */
    HISTORY_CHECKERNO = 'HISTORY_CHECKERNO',
    /**
     * 手机名称
     */
    HISTORY_DEVICENAME = 'HISTORY_DEVICENAME',
    /**
     * 手机持有人
     */
    HISTORY_DEVICEHOLDER = 'HISTORY_DEVICEHOLDER',
    /**
     * 手机编号
     */
    HISTORY_DEVICENUMBER = 'HISTORY_DEVICENUMBER'

};

/**
 * 用户输入历史记录
 */
class UserHistory {

    /**
     * 设置历史记录
     * @param key 键名
     * @param value 值
     */
    static set(key: string, value: string): void {
        let temp = localStore.get(key);
        let newSet: any;
        if (helper.isNullOrUndefinedOrEmptyString(temp)) {
            if (helper.isNullOrUndefinedOrEmptyString(value)) {
                newSet = new Set([]);
            } else {
                newSet = new Set([value]);
            }
        } else {
            if (helper.isNullOrUndefinedOrEmptyString(value)) {
                newSet = new Set([...temp]);
            } else {
                newSet = new Set([value, ...temp]);
            }
        }
        localStore.set(key, Array.from(newSet));
    }

    /**
     * 获取历史记录
     * @param key 键名
     */
    static get(key: string): string[] {
        let value = localStore.get(key);
        if (helper.isNullOrUndefined(value)) {
            return [];
        } else {
            return localStore.get(key) as string[];
        }
    }
}

export { HistoryKeys };
export default UserHistory;