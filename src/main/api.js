const { statSync } = require('fs');
const { join, basename } = require('path');
const express = require('express');
const { ipcMain, ipcRenderer } = require('electron');
const { getWLANIP } = require('./utils');
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

	router.get('/check/:cid', (req, res) => {
		const caseId = req.params['cid'];
		getWLANIP()
			.then((ip) => {
				res.render('check', { ip, caseId });
			})
			.catch(() => {
				res.render('check', { ip: '0.0.0.0', caseId });
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

	router.post('/apk', (req, res) => {
		let target = null;
		if (isDev) {
			target = join(cwd, 'data/test.apk');
		} else {
			target = join(cwd, 'resources/data/test.apk');
		}
		try {
			const stat = statSync(target);
			console.log(stat.size);
			res.setHeader('Content-Length', stat.size);
		} catch (error) {
			console.log(error);
		} finally {
			res.setHeader('Content-type', 'application/vnd.android.package-archive');
		}

		res.download(target, '快速点验.apk', (err) => {
			if (err) {
				res.end(err.message);
			}
		});
	});

	return router;
}

module.exports = api;
