const path = require('path');
const { Database } = require('sqlite3').verbose();

const isDev = process.env['NODE_ENV'];

let defaultDatabasePath = null;
if (isDev === 'development') {
	defaultDatabasePath = path.join(process.cwd(), 'data/base.db');
} else {
	defaultDatabasePath = path.join(process.cwd(), 'resources/data/base.db');
}

class Helper {
	_path = null;

	constructor(dbPath) {
		this._path = dbPath || defaultDatabasePath;
	}
	/**
	 * 执行SQL
	 * @param {string} sql SQL语句
	 * @param {string[]} params 参数
	 * @returns {Promise<string>}
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
	 * @returns {Promise<any[]>} 结果集
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
	 * @returns {Promise<any>}
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
