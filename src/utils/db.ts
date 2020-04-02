import path from 'path';
import DataStore from 'nedb';
import config from '@src/config/ui.config.json';
import { helper } from './helper';

const publishPath = localStorage.getItem('PUBLISH_PATH')!;


class Db<T> {

    private _dbpath = '';
    private _collection = '';

    /**
     * 实例化NeDB
     * @param collection 集合名称
     * @param dbPath 路径，默认存在配置userLogPath目录下
     */
    constructor(collection: string, dbPath?: string) {
        this._collection = collection;
        if (helper.isNullOrUndefined(dbPath)) {
            this._dbpath = path.join(publishPath, (config as any).userLogPath, `${this._collection}.nedb`);
        } else {
            this._dbpath = path.join(dbPath!, `${this._collection}.nedb`);
        }
    }
    /**
     * 条件查询，查无数据返回[]
     * @param condition 条件对象（可值查询、正则、条件等）
     */
    find(condition: any) {
        const db = new DataStore({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<any[]>((resolve, reject) => {
            db.loadDatabase((err: Error) => {
                if (err) {
                    reject(err);
                }
                db.find(condition, (err: Error, docs: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                });
            });
        });
    }
    /**
     * 条件查询返回第一条数据
     * @param condition 查询条件
     */
    findOne(condition: any) {
        const db = new DataStore({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<any>((resolve, reject) => {
            db.loadDatabase((err: Error) => {
                if (err) {
                    reject(err);
                }
                db.findOne(condition, (err: Error, docs: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                });
            });
        });
    }
    /**
     * 分页查询
     * @param condition 条件
     * @param pageIndex 当前页
     * @param pageSize 页尺寸
     * @param sortField 排序字段
     * @param asc 正序逆序
     */
    findByPage(condition: any, pageIndex: number = 1, pageSize: number = 15, sortField?: string, asc: 1 | -1 = 1) {
        const db = new DataStore({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<any[]>((resolve, reject) => {
            db.loadDatabase((err: Error) => {
                if (err) {
                    reject(err);
                }
                let cursor = db.find(condition);
                if (sortField) {
                    cursor = cursor.sort({ [sortField]: asc });
                }
                cursor.skip((pageIndex - 1) * pageSize).limit(pageSize).exec((err, docs: any[]) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                });
            });
        });
    }
    /**
     * 插入文档, 返回插入的行数
     * @param doc 文档对象
     */
    insert(doc: T) {
        const db = new DataStore({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<T>((resolve, reject) => {
            db.loadDatabase((err: Error) => {
                if (err) {
                    reject(err);
                }
                db.insert(doc, (err: Error, document: T) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(document);
                    }
                });
            });
        });
    }
    /**
     * 删除集合中符合条件的记录, 返回删除的行数
     * @param condition 条件
     * @param multi 是否删除多条
     */
    remove(condition: any, multi: boolean = false) {
        const db = new DataStore({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<number>((resolve, reject) => {
            db.loadDatabase((err: Error) => {
                if (err) {
                    reject(err);
                }
                db.remove(condition, { multi }, (err, numRemoved: number) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(numRemoved);
                    }
                });
            });
        });
    }
    /**
     * 更新文档, 返回更新的行数
     * @param condition 条件
     * @param newDoc 新对象
     * @param multi 是否批量
     */
    update(condition: any, newDoc: T, multi: boolean = false) {
        const db = new DataStore({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<number>((resolve, reject) => {
            db.loadDatabase((err) => {
                if (err) {
                    reject(err);
                }
                db.update(condition, newDoc, { multi }, (err, numReplaced) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(numReplaced);
                    }
                });
            });
        });
    }
    /**
     * 返回查询条件的结果数量
     * @param condition 条件对象
     */
    count(condition: any) {
        const db = new DataStore({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<number>((resolve, reject) => {
            db.loadDatabase((err: Error) => {
                if (err) {
                    reject(err);
                }
                db.count(condition, (err: Error, size: number) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(size);
                    }
                });
            });
        });
    }
    /**
     * 返回集合中所有文档数据
     */
    getAll() {
        const db = new DataStore<T>({
            filename: this._dbpath,
            timestampData: true
        });
        return new Promise<Array<T>>((resolve, reject) => {
            db.loadDatabase((err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(db.getAllData());
                }
            });
        });
    }
    /**
     * 查询条件是否是空
     * #当查询条件的所有属性都是null或undefined时返回true
     * @param condition 条件对象
     */
    static isEmptyCondition(condition: any) {
        if (helper.isNullOrUndefined(condition)) {
            return true;
        }
        let undefinedCount = 0;
        for (let attr in condition) {
            if (helper.isNullOrUndefined(condition[attr])) {
                undefinedCount++;
            }
        }
        return undefinedCount === Object.keys(condition).length;
    }
}

export default Db;