const path = require('path');
const { Database } = require('sqlite3').verbose();


class Helper {

    _path = null;

    constructor(dbPath) {
        this._path = dbPath || path.resolve(__dirname, '../../../data/base.db');
        console.log('path', this._path);
    }
    /**
     * 执行SQL
     * @param {string} sql SQL语句
     * @param {string[]} params 参数
     */
    execute(sql, params = []) {
        let db = null;
        return new Promise((resolve, reject) => {
            db = new Database(this._path, (err) => {
                if (err) {
                    console.log(`打开数据库失败: ${err.message}`);
                    db = null;
                    reject(err);
                } else {
                    db.run(sql, params, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve('success');
                        }
                    });
                    db.close();
                }
            });
        });
    }
    /**
     * 执行SQL查询
     * @param {string} sql SQL语句
     * @param {string[]} params 参数
     */
    query(sql, params = []) {
        let db = null;
        return new Promise((resolve, reject) => {
            db = new Database(this._path, (err) => {
                if (err) {
                    console.log(`打开数据库失败: ${err.message}`);
                    db = null;
                    reject(err);
                } else {
                    db.all(sql, params, (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                    db.close();
                }
            });
        });
    }
    /**
     * 执行SQL，查询首行数据
     * @param {string} sql  SQL语句
     * @param {string[]} params 参数
     */
    scalar(sql, params = []) {
        let db = null;
        return new Promise((resolve, reject) => {
            db = new Database(this._path, (err) => {
                if (err) {
                    console.log(`打开数据库失败: ${err.message}`);
                    db = null;
                    reject(err);
                } else {
                    db.get(sql, params, (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                    db.close();
                }
            });
        });
    }
}

module.exports = Helper;