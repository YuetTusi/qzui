const fs = require('fs');
const cpy = require('cpy');
const log = require('../log');

/**
 * 创建目录
 * @param {string} dir 目录路径
 */
function mkdir(dir) {
	return new Promise((resolve, reject) => {
		fs.mkdir(dir, { recursive: true }, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

/**
 * 拷贝文件
 * @param {string} from 源地址
 * @param {string} to 目的地址
 */
function copy(from, to) {
	return new Promise((resolve, reject) => {
		let rs = fs.createReadStream(from);
		let ws = fs.createWriteStream(to);
		rs.pipe(ws);
		ws.once('error', (e) => {
			if (e.stack.includes('ENOSPC')) {
				//磁盘空间不足任务失败
				log.error(`拷贝失败,磁盘空间不足:${e.message}`);
				reject(e);
			}
		});
		rs.once('error', (e) => {
			log.error(`拷贝失败: ${e.message}`);
			console.error(e);
			resolve();
		});
		rs.once('end', () => resolve());
	});
}

/**
 * 批量拷贝文件
 * @param {string[]} fileList
 * @param {string} destination
 * @param {object} options
 */
function copyFiles(fileList, destination, options) {
	return cpy(fileList, destination, options);
}

/**
 * 写入JSON文件，原文件会覆盖
 * @param filePath 文件路径
 * @param data JSON数据
 */
function writeJSONfile(filePath, data) {
	return new Promise((resolve, reject) => {
		let json = '';
		if (typeof data === 'string') {
			json = data;
		} else {
			try {
				json = JSON.stringify(data);
			} catch (error) {
				reject(error);
			}
		}
		fs.writeFile(filePath, json, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

/**
 * 读取JSON文件
 * @param filePath 文件路径
 */
function readJSONFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, { encoding: 'utf8' }, (err, chunk) => {
			if (err) {
				reject(err);
			} else {
				try {
					resolve(JSON.parse(chunk));
				} catch (error) {
					reject(error);
				}
			}
		});
	});
}

module.exports = {
	mkdir,
	copy,
	copyFiles,
	readJSONFile,
	writeJSONfile
};
