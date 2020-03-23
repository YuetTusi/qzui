import EventEmitter from 'events';
import path from 'path';
import sqlite3 from 'sqlite3';
import config from '@src/config/ui.config.json';
import { helper } from './helper';

const sqlite = sqlite3.verbose();
let dbPath: string = path.join(localStorage.getItem('PUBLISH_PATH')!, config.userLogDB);

/**
 * Sqlite数据库操作
 * #实例化时可传入路径，不传使用配置的默认路径
 */
class Db extends EventEmitter {
    public readonly databasePath: string = './userlog.db';
    constructor(databasePath?: string) {
        super();
        if (databasePath) {
            this.databasePath = databasePath;
        } else {
            this.databasePath = dbPath;
        }
    }
    /**
     * 执行SQL
     * @param sql SQL语句
     * @param parameters 参数列表
     */
    run(sql: string, parameters?: any[]) {
        return new Promise((resolve, reject) => {
            let db = new sqlite.Database(this.databasePath, (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    this.emit('db-open');
                }
            });
            db.serialize(() => {
                db.run(sql, parameters, (err: Error | null) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(null);
                    }
                });
            });
            db.close(() => this.emit('db-close'));
        });
    }
    /**
     * 运行SQL返回结果集
     * @param sql SQL语句
     * @param parameters 参数列表
     */
    all(sql: string, parameters?: any[]) {
        return new Promise((resolve, reject) => {
            let db = new sqlite.Database(this.databasePath, (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    this.emit('db-open');
                }
            });
            db.serialize(() => {
                db.all(sql, parameters, (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            db.close(() => this.emit('db-close'));
        });
    }
    /**
     * 运行SQL返回首行数据
     * @param sql SQL语句
     * @param parameters 参数列表
     */
    get(sql: string, parameters?: any[]) {
        return new Promise((resolve, reject) => {
            let db = new sqlite.Database(this.databasePath, (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    this.emit('db-open');
                }
            });
            db.serialize(() => {
                db.get(sql, parameters, (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        let val = helper.isNullOrUndefined(row) ? null : row;
                        resolve(val);
                    }
                });
            });
            db.close(() => this.emit('db-close'));
        });
    }
}

export default Db;
