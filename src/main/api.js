const { statSync } = require('fs');
const { readdir, readFile } = require('fs/promises');
const { join, basename } = require('path');
const express = require('express');
const { ipcMain } = require('electron');
const xlsx = require('node-xlsx');
const log = require('../renderer/log');
const { existFile } = require('./utils');

const { Router } = express;
const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';

/**
 * Http接口
 * @param webContents
 */
function api(webContents) {
	const router = Router();

	router.get('/', (_, res) =>
		res.json({
			data: 'HTTP接口',
			routes: [
				{
					path: '/case',
					desc: '案件数据（解析完成&解析异常）'
				},
				{
					path: '/wifi-case',
					desc: '快速点验案件'
				},
				{
					path: '/keyword',
					desc: '当前关键词'
				},
				{
					path: '/app/:type',
					desc: '解析应用（parse-app），Token云取应用（token-app）'
				}
			]
		})
	);

	router.get('/case', (_, res) => {
		ipcMain.once('query-case-result', (_, result) => res.json(result));
		webContents.send('query-case');
	});

	router.get('/wifi-case', (req, res) => {
		const { id } = req.params;
		ipcMain.once('query-wifi-case-result', (_, result) => res.json(result));
		webContents.send('query-wifi-case', id);
	});

	router.get('/app/:type', (req, res) => {
		const { type } = req.params;
		ipcMain.once('read-app-yaml-result', (_, result) => res.json(result));
		webContents.send('read-app-yaml', type);
	});

	router.get('/test', (_, res) => {
		res.json({ cwd });
	});

	router.get('/check/:cid', (_, res) => {
		let target = null;
		if (isDev) {
			target = join(cwd, 'data/TZSafe-wifi.apk'); //TZSafe.apk
		} else {
			target = join(cwd, '../n_fetch/config/android/TZSafe-wifi.apk');
		}

		try {
			const stat = statSync(target);
			res.setHeader('Content-Length', stat.size);
		} catch (error) {
			console.log(error);
		} finally {
			res.setHeader('Content-type', 'application/octet-stream');
		}

		res.download(target, '快速点验.apk', (err) => {
			if (err) {
				res.end(err.message);
			}
		});
	});

	//接收点验结果发送给mainWindow入库并开始解析
	router.post('/check', (req, res) => {
		webContents.send('check-parse', req.body);
		res.json({
			success: true,
			data: req.body
		});
	});

	router.get('/keyword', async (_, res) => {
		const appJsonPath = isDev
			? join(cwd, 'data/app.json')
			: join(cwd, 'resources/config/app.json');
		const tempPath = join(cwd, './resources/army'); //默认模板位置
		const userPath = join(cwd, './resources/keywords'); //用户模板位置

		// const tempPath = 'D:\\Electronic\\ElectronicForensics\\qzui\\resources\\army'; //默认模板位置
		// const userPath = 'D:\\Electronic\\ElectronicForensics\\qzui\\resources\\keywords'; //用户模板位置

		let data = {};

		try {
			const exist = await existFile(appJsonPath);

			if (exist) {
				const [cfg, tempFiles, userFiles] = await Promise.all([
					readFile(appJsonPath, { encoding: 'utf8' }),
					readdir(tempPath),
					readdir(userPath)
				]);
				const { useDefaultTemp, useDocVerify } = JSON.parse(cfg);
				let all = [];
				if (useDocVerify) {
					if (useDefaultTemp) {
						all = all.concat(
							tempFiles
								.filter((item) => item !== 'template.xlsx')
								.map((item) => join(tempPath, item))
						);
					}
					all = all.concat(
						userFiles
							.filter((item) => item !== 'template.xlsx' && !item.startsWith('~'))
							.map((item) => join(userPath, item))
					);
				}

				data = all.reduce((acc, current) => {
					const sort = basename(current, '.xlsx');
					try {
						const [sheet] = xlsx.parse(current);
						if (sheet.data && sheet.data.length > 0) {
							sheet.data.shift();
							acc[sort] = sheet.data
								.filter((k) => k[0] !== undefined && k[0] !== null && k[0] !== '')
								.map((k) => k[0]);
						}
					} catch (error) {
						if (error.message.includes('password-protected')) {
							log.warn(`未能读取${current}: Excel已加密`);
						} else {
							log.warn(`读取${current}.xlsx失败: ${error.message}`);
						}
					}
					return acc;
				}, {});
				res.json(data);
			} else {
				res.json(null);
			}
		} catch (error) {
			log.error(`读取关键词失败: ${error.message}`);
			res.json(null);
		}
	});

	//返回案件下predict.json配置
	router.get('/predict/:id', (req, res) => {
		ipcMain.once('query-case-by-id-result', async (_, result) => {
			if (result) {
				const predictAt = join(
					result?.m_strCasePath,
					result?.m_strCaseName,
					'predict.json'
				);
				try {
					const exist = await existFile(predictAt);
					if (exist) {
						const ai = await readFile(predictAt, { encoding: 'utf8' });
						res.json(JSON.parse(ai));
					} else {
						res.json(null);
					}
				} catch (error) {
					log.error(`读取案件predict.json失败(id:${req.params.id}): ${error.message}`);
					res.json(null);
				}
			} else {
				res.json(null);
			}
		});
		webContents.send('query-case-by-id', req.params.id);
	});

	router.get('/ai-model', async (_, res) => {
		const target = isDev
			? join(cwd, 'data/mobilev2.pt')
			: join(cwd, 'resources/data/mobilev2.pt');

		try {
			const { size } = await stat(target);
			webContents.send('quick-scanned', true);
			res.setHeader('Content-Length', size);
			log.info(`下载AI模型文件(${target}), 附件大小:${size}`);
		} catch (error) {
			log.error(`HTTP下载AI模型文件失败 /ai-model: ${error.message}`);
		} finally {
			res.setHeader('Content-type', 'application/octet-stream');
		}

		res.download(target, 'mobilev2.pt', (err) => {
			if (err) {
				res.end(err.message);
			}
		});
	});

	//被告知已超用户空闲时限
	router.get('/overtime', (req, res) => {
		webContents.send('overtime');
		res.end();
	});

	return router;
}

module.exports = api;
