const { getDb } = require('./db');

/**
 * 查询全部
 */
const all = (event, doc) => getDb(doc).all();

/**
 * 条件查询
 */
const find = (event, doc, condition, sortField = 'updatedAt', asc = 1) =>
	getDb(doc).find(condition, sortField, asc);

/**
 * 查询首条
 */
const findOne = (event, doc, condition) => getDb(doc).findOne(condition);

/**
 * 分页查询
 */
const findByPage = (
	event,
	doc,
	condition,
	pageIndex = 1,
	pageSize = 15,
	sortField = 'updatedAt',
	asc = 1
) => getDb(doc).findByPage(condition, pageIndex, pageSize, sortField, asc);

/**
 * 插入数据
 */
const insert = (event, doc, data) => getDb(doc).insert(data);

/**
 * 删除数据
 */
const remove = (event, doc, conditon, multi = false) => getDb(doc).remove(conditon, multi);

/**
 * 更新数据
 */
const update = (event, doc, condition, newDoc, multi = false) =>
	getDb(doc).update(condition, newDoc, multi);

/**
 * 查询结果数量
 */
const count = (event, doc, condition) => getDb(doc).count(condition);

module.exports = {
	all,
	find,
	findOne,
	findByPage,
	insert,
	remove,
	update,
	count
};
