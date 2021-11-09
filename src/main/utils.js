const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
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

/**
 * 读取app配置
 * @param string mode 模式
 */
function loadAppJson(mode) {
	const jsonPath =
		mode === 'development'
			? path.join(appRoot, 'data/app.json')
			: path.join(appRoot, '../config/app.json');
	try {
		const data = fs.readFileSync(jsonPath, { encoding: 'utf8' });
		return JSON.parse(data);
	} catch (error) {
		return null;
	}
}

/**
 * 写app配置
 * @param string mode 模式
 * @param string data 数据
 */
function writeAppJson(mode, data) {
	const jsonPath =
		mode === 'development'
			? path.join(appRoot, 'data/app.json')
			: path.join(appRoot, '../config/app.json');

	try {
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}
		fs.writeFileSync(jsonPath, data, { encoding: 'utf8' });
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * 是否存在manufaturer.json文件
 * @param {String} mode 当前模式
 * @param {String} appPath 应用所在路径
 */
function existManufaturer(mode, appPath) {
	if (mode === 'development') {
		try {
			fs.accessSync(path.join(appPath, 'data/manufaturer.json'));
			return true;
		} catch (error) {
			return false;
		}
	} else {
		try {
			fs.accessSync(path.join(appPath, '../config/manufaturer.json'));
			return true;
		} catch (error) {
			return false;
		}
	}
	//manufaturer
}

function runProc(handle, exeName, exePath, exeParams = []) {
	handle = spawn(exeName, exeParams, {
		cwd: exePath
	});
	handle.once('error', () => {
		console.log(`${exeName}启动失败`);
		handle = null;
	});
}

/**
 * 是否是Win7系统
 * @returns {boolean} Win7系统为true
 */
function isWin7() {
	return process.platform === 'win32' && os.release().startsWith('6.1');
}

module.exports = {
	readAppName,
	loadConf,
	loadAppJson,
	writeAppJson,
	existManufaturer,
	runProc,
	isWin7
};
