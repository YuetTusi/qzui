import differenceWith from 'lodash/differenceWith';

const TIPS_BACKUP = 'TIPS_BACKUP'; //步骤反馈存储key

/**
 * 本地存储
 */
let sessionStore = {
    /**
     * 存储数据
     * @param key 键
     * @param value 值
     */
    set(key: string, value: any) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    /**
     * 获取数据
     * @param key 键
     * @param value 值
     */
    get(key: string) {
        let values = sessionStorage.getItem(key);
        if (values) {
            return JSON.parse(values as string);
        } else {
            return null;
        }
    },
    /**
     * 移除数据
     * @param key 键
     */
    remove(key: string) {
        sessionStorage.removeItem(key);
    },
    /**
     * 清空所有Session数据
     */
    clear() {
        sessionStorage.clear();
    }
};

/**
 * 处理步骤框状态存储
 * 数据格式：[{id:"751051aePort_#0001.Hub_#0004",AppDataExtractType:3},...]
 */
let tipsStore = {
    /**
     * 存储弹框数据(有id存在不追加)
     * @param tipsData 弹框数据
     */
    set(tipsData: any) {
        let store = sessionStore.get(TIPS_BACKUP) as Array<any>;
        if (store === null) {
            sessionStore.set(TIPS_BACKUP, [tipsData]);
        } else {
            //?若有数据，验证是否存在
            if (!this.exist(tipsData.id)) {
                store.push(tipsData);
                sessionStore.set(TIPS_BACKUP, store);
            }
        }
    },
    /**
     * 获取参数id的弹框数据
     * @param id 
     */
    get(id: string) {
        let store = sessionStore.get(TIPS_BACKUP) as Array<any>;
        if (store === null) {
            return null;
        }
        let tipsData = store.find((item: any) => item.id === id);
        if (tipsData) {
            return tipsData;
        } else {
            return null;
        }
    },
    /**
     * 验证弹框数据是否存在
     * @param id 弹框数据id
     */
    exist(id: string) {
        let store = sessionStore.get(TIPS_BACKUP) as Array<any>;
        if (store === null) {
            return false;
        }
        let has = store.findIndex((item: any) => item.id === id);
        return has !== -1;
    },
    /**
     * 删除弹框id数据
     * @param id 弹框id
     */
    remove(id: string) {
        let store = sessionStore.get(TIPS_BACKUP) as Array<any>;
        let updated: Array<any> = [];
        if (store !== null) {
            updated = store.filter((item: any) => item.id !== id);
        }
        sessionStore.set(TIPS_BACKUP, updated);
    },
    /**
     * 删除掉list参数中没有的数据（根据id判断）
     * @param list 弹框数据列表
     */
    removeDiff(list: Array<any>) {
        let store = sessionStore.get(TIPS_BACKUP);
        //NOTE:最新监听数据与SessionStorage中比出差值，删除掉
        let diff = differenceWith(store, list, (a: any, b: any) => a.id === b.id);
        diff.forEach((item: any) => this.remove(item.id));
    }
};

export { tipsStore };
export default sessionStore;