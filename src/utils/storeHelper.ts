import ElectronStore from 'electron-store';
import { helper } from './helper';


class StoreHelper {
    private _store: any;
    public readonly path: string;

    constructor() {
        if (helper.isNullOrUndefined(this._store)) {
            this._store = new ElectronStore();
        }
        this.path = this._store.path;
    }
    /**
     * 存储数据
     * @param key 键
     * @param value 值
     */
    set(keyOrObj: string | object, value: any) {
        if (helper.isString(keyOrObj)) {
            this._store.set(keyOrObj, value);
        } else {
            this._store.set(keyOrObj);
        }

    }
    /**
     * 取得键值数据
     * @param key 键
     */
    get(key: string) {
        return this._store.get(key);
    }
    /**
     * 删除键值数据
     * @param key 键
     */
    delete(key: string) {
        return this._store.delete(key);
    }
    /**
     * 是否存在此键
     * @param key 键
     */
    has(key: string) {
        return this._store.has(key);
    }
    /**
     * 当前仓库键数量
     */
    size() {
        return this._store.size;
    }
    /**
     * 清空所有数据
     */
    clear() {
        this._store.clear();
    }
}

export default StoreHelper;