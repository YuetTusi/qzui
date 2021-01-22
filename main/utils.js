const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');
const appRoot = process.cwd();
const KEY = 'az';

const jsonPath =
	process.env['NODE_ENV'] === 'development'
		? path.join(appRoot, './data/manufaturer.json')
		: path.join(appRoot, './resources/config/manufaturer.json');

/**
 * 读取应用名称
 */
function readAppName() {
	try {
		const data = fs.readFileSync(jsonPath, { encoding: 'utf8' });
		const next = JSON.parse(data);
		return next.materials_name;
	} catch (error) {
		return undefined;
	}
}

/**
 * 读取conf配置文件
 * @param {String} mode 当前模式
 * @param {String} appPath 应用所在路径
 */
function loadConf(mode, appPath) {
	let config = {};
	if (mode === 'development') {
		config = yaml.safeLoad(fs.readFileSync(path.join(appPath, 'src/config/ui.yaml'), 'utf8'));
	} else {
		try {
			let chunk = fs.readFileSync(path.join(appPath, '../config/conf'), 'utf8');
			const decipher = crypto.createDecipher('rc4', KEY);
			let conf = decipher.update(chunk, 'hex', 'utf8');
			conf += decipher.final('utf8');
			config = yaml.safeLoad(conf);
		} catch (error) {
			config = null;
		}
	}
	return config;
}

module.exports = { readAppName, loadConf };
