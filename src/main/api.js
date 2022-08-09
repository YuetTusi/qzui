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

	router.get('/', (req, res) =>
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

	router.get('/case', (req, res) => {
		ipcMain.once('query-case-result', (event, result) => res.json(result));
		webContents.send('query-case');
	});

	router.get('/wifi-case', (req, res) => {
		const { id } = req.params;
		ipcMain.once('query-wifi-case-result', (event, result) => res.json(result));
		webContents.send('query-wifi-case', id);
	});

	router.get('/app/:type', (req, res) => {
		const { type } = req.params;
		ipcMain.once('read-app-yaml-result', (event, result) => res.json(result));
		webContents.send('read-app-yaml', type);
	});

	router.get('/test', (req, res) => {
		res.json({ cwd });
	});

	router.get('/check/:cid', (req, res) => {
		let target = null;
		if (isDev) {
			target = join(cwd, 'data/TZSafe.apk');
		} else {
			target = join(cwd, '../n_fetch/config/android/TZSafe.apk');
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

	router.get('/keyword', async (req, res) => {
		const appJsonPath = isDev
			? join(cwd, 'data/app.json')
			: join(cwd, 'resources/config/app.json');
		const tempPath = join(cwd, './resources/army'); //默认模板位置
		const userPath = join(cwd, './resources/keywords'); //用户模板位置

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
								.filter(
									(item) => item !== 'apps_info.xlsx' && item !== 'template.xlsx'
								)
								.map((item) => join(tempPath, item))
						);
					}
					all = all.concat(
						userFiles
							.filter((item) => !item.startsWith('~'))
							.map((item) => join(userPath, item))
					);
				}

				data = all.reduce((acc, current) => {
					const sort = basename(current, '.xlsx');
					const [sheet] = xlsx.parse(current);
					if (sheet.data && sheet.data.length > 0) {
						sheet.data.shift();
						acc[sort] = sheet.data
							.filter((k) => k[0] !== undefined && k[0] !== null && k[0] !== '')
							.map((k) => k[0]);
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

	return router;
}

module.exports = api;
