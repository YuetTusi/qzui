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

export default sessionStore;