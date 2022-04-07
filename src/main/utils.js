const net = require('net');
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec, spawn } = require('child_process');
const yaml = require('js-yaml');
const log = require('../renderer/log');

const appRoot = process.cwd();
const KEY = 'az';

const jsonPath =
	process.env['NODE_ENV'] === 'development'
		? path.join(appRoot, './data/manufaturer.json')
		: path.join(appRoot, './resources/config/manufaturer.json');

/**
 * 读取manufaturer
 */
function readManufaturer() {
	try {
		const data = fs.readFileSync(jsonPath, { encoding: 'utf8' });
		const next = JSON.parse(data);
		return next;
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
			: path.join(appRoot, './resources/config/app.json');

	let exist = false;
	try {
		fs.accessSync(jsonPath);
		exist = true;
	} catch (error) {
		exist = false;
	}

	try {
		if (!exist) {
			fs.writeFileSync(jsonPath, JSON.stringify({ disableSocketDisconnectWarn: false }));
		}
		const data = fs.readFileSync(jsonPath, { encoding: 'utf8' });
		return JSON.parse(data);
	} catch (error) {
		throw error;
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
			: path.join(appRoot, './resources/config/app.json');

	try {
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}
		fs.writeFileSync(jsonPath, data, { encoding: 'utf8' });
		return true;
	} catch (error) {
		console.log(error);
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
}

/**
 * 启动服务进程
 * @param {ChildProcessWithoutNullStreams|null} handle 服务handle
 * @param {string} exeName exe文件名称
 * @param {string} exePath exe所在目录
 * @param {string[]} exeParams 参数
 */
function runProc(handle, exeName, exePath, exeParams = []) {
	handle = spawn(exeName, exeParams, {
		cwd: exePath
	});
	handle.once('error', () => {
		console.log(`${exeName}启动失败`);
		log.error(`${exeName}启动失败,exePath:${exePath}`);
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

/**
 * 返回空闲端口
 * @param {number} port 端口号
 * @description 传入初始端口检测占用情况，递增直到可用
 * @returns Promise<number> 返回空闲可用端口号
 */
function portStat(port) {
	const server = net.createServer();
	return new Promise((resolve, reject) => {
		if (typeof port !== 'number') {
			reject(new TypeError('Port is not a number'));
		}
		server.listen(port, '0.0.0.0');
		server.on('listening', () => {
			server.close();
			resolve(port);
		});
		server.on('error', (err) => {
			server.close();
			if (err.code === 'EADDRINUSE') {
				console.log(`端口${port}已占用`);
				return resolve(portStat(++port));
			} else {
				reject(err);
			}
		});
	});
}

/**
 * 写net.json文件
 * @param {string} cwd
 * @param {object} chunk
 */
async function writeNetJson(cwd, chunk) {
	const { writeFile } = fs.promises;

	const saveAs =
		process.env['NODE_ENV'] === 'development'
			? path.join(cwd, './data/net.json')
			: path.join(cwd, './resources/config/net.json');

	try {
		await writeFile(saveAs, JSON.stringify(chunk), { encoding: 'utf8' });
	} catch (error) {
		log.error(`写入net.json失败 @writeNetJson(): ${error.message}`);
	}
}

function getWLANIP() {
	const command = 'ipconfig';

	return new Promise((resolve, reject) => {
		exec(command, (err, stdout) => {
			if (err) {
				console.log(err);
				reject('0.0.0.0');
			} else {
				let cmdResults = stdout.trim().split('\r\n');
				let start = cmdResults.findIndex((item) => item.includes('WLAN'));
				if (start === -1) {
					resolve('0.0.0.0');
				} else {
					let ip = '0.0.0.0';
					cmdResults = cmdResults.slice(start);
					for (let i = 0; i < cmdResults.length; i++) {
						if (cmdResults[i].includes(':')) {
							const [name, value] = cmdResults[i].split(':');
							if (name.includes('IPv4')) {
								ip = value.trim();
								break;
							}
						}
					}
					resolve(ip);
				}
			}
		});
	});
}

module.exports = {
	readManufaturer,
	loadConf,
	loadAppJson,
	writeAppJson,
	existManufaturer,
	runProc,
	isWin7,
	portStat,
	writeNetJson,
	getWLANIP
};
