import localStore from './localStore';
import { helper } from './helper';

const maxCount = 10; //最大存储数量

/**
 * 历史记录键名枚举
 */
enum HistoryKeys {
    /**
     * 检验单位
     */
    HISTORY_UNITNAME = 'HISTORY_UNITNAME',
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
    HISTORY_DEVICENUMBER = 'HISTORY_DEVICENUMBER',
    /**
     * 手机号
     */
    HISTORY_MOBILENUMBER = 'HISTORY_MOBILENUMBER'
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
        let next: any;
        if (helper.isNullOrUndefinedOrEmptyString(temp)) {
            if (helper.isNullOrUndefinedOrEmptyString(value)) {
                next = new Set([]);
            } else {
                next = new Set([value]);
            }
        } else {
            if (helper.isNullOrUndefinedOrEmptyString(value)) {
                next = new Set([...temp]);
            } else if (temp !== null && temp.length > maxCount) {
                temp.splice(-1, 1);
                next = new Set([value, ...temp]);
            } else {
                next = new Set([value, ...temp]);
            }
        }
        localStore.set(key, Array.from(next));
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
    /**
     * 清除键下的所有数据
     * @param key 键
     */
    static clear(key: string): void {
        localStore.remove(key);
    }
}

export { HistoryKeys };
export default UserHistory;