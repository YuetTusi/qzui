const path = require('path');
const DataStore = require('nedb');

const pool = new Map();

/**
 * 封装NeDB操作
 */
class Db {
	_instance = null;
	_dbpath = '';
	_collection = '';

	/**
	 * 实例化NeDB
	 * @param {string} collection 集合名称
	 */
	constructor(collection) {
		this._collection = collection;
		this._dbpath = path.join(process.cwd(), `qzdb/${collection}.nedb`);
		this._instance = new DataStore({
			filename: this._dbpath,
			timestampData: true
		});
	}
	/**
	 * 返回集合中所有文档数据
	 */
	all() {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				} else {
					resolve(this._instance.getAllData());
				}
			});
		});
	}
	/**
	 * 条件查询，查无数据返回[]
	 * @param condition 条件对象（可值查询、正则、条件等）
	 */
	find(condition, sortField = 'updatedAt', asc = 1) {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				}
				this._instance
					.find(condition)
					.sort({ [sortField]: asc })
					.exec((err, docs) => {
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
	 * 若查无记录则返回null
	 * @param condition 查询条件
	 */
	findOne(condition) {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				}
				this._instance.findOne(condition, (err, docs) => {
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
	 * @param {any} condition 条件
	 * @param {number} pageIndex 当前页
	 * @param {number} pageSize 页尺寸
	 * @param {string} sortField 排序字段
	 * @param {1|-1} asc 正序逆序
	 */
	findByPage(condition, pageIndex = 1, pageSize = 15, sortField = 'updatedAt', asc = 1) {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				}
				let cursor = this._instance.find(condition);
				if (sortField) {
					cursor = cursor.sort({ [sortField]: asc });
				}
				cursor
					.skip((pageIndex - 1) * pageSize)
					.limit(pageSize)
					.exec((err, docs) => {
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
	 * 插入文档
	 * @param {any} doc 文档对象
	 * @returns {Promise<T>}
	 */
	insert(doc) {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				}
				this._instance.insert(doc, (err, document) => {
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
	 * @param {any} condition 条件
	 * @param {boolean} multi 是否删除多条
	 * @returns {Promise<number>}
	 */
	remove(condition, multi = false) {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				}
				this._instance.remove(condition, { multi }, (err, numRemoved) => {
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
	 * @param {any} condition 条件
	 * @param {any} newDoc 新对象
	 * @param {boolean} multi 是否批量
	 * @returns {Promise<number>} 更新行数
	 */
	update(condition, newDoc, multi = false) {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				}
				this._instance.update(condition, newDoc, { multi }, (err, numReplaced) => {
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
	 * @param {any} condition 条件对象
	 */
	count(condition) {
		return new Promise((resolve, reject) => {
			this._instance.loadDatabase((err) => {
				if (err) {
					reject(err);
				}
				this._instance.count(condition, (err, size) => {
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
	 * 查询条件是否是空
	 * #当查询条件的所有属性都是null或undefined时返回true
	 * @param {any} condition 条件对象
	 */
	static isEmptyCondition(condition) {
		if (condition === undefined || condition === null) {
			return true;
		}
		let undefinedCount = 0;
		for (let attr in condition) {
			if (condition[attr] === undefined || condition[attr] === null) {
				undefinedCount++;
			}
		}
		return undefinedCount === Object.keys(condition).length;
	}
}

/**
 * 得到数据实例
 * @param {string} collection
 */
function getDb(collection) {
	if (pool.has(collection)) {
		return pool.get(collection);
	} else {
		const db = new Db(collection);
		pool.set(collection, db);
		return db;
	}
}

module.exports = {
	Db,
	getDb
};
