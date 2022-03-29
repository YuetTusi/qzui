const { join } = require('path');
const express = require('express');
const { ipcMain } = require('electron');
const { getLocalAddress } = require('./utils');
const { Router } = express;

const ip = getLocalAddress() ?? '';
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

	router.get('/app/:type', (req, res) => {
		const { type } = req.params;
		ipcMain.once('read-app-yaml-result', (event, result) => res.json(result));
		webContents.send('read-app-yaml', type);
	});

	router.get('/check/:cid', (req, res) => {
		const caseId = req.params['cid'];
		res.render('check', { ip, caseId });
	});

	router.post('/apk', (req, res) => {
		let target = null;
		if (isDev) {
			target = join(cwd, 'data/test.apk');
		} else {
			target = join(cwd, 'resources/data/test.apk');
		}
		res.sendFile(target, (err) => {
			if(err){
				res.end(err.message);
			}
		});
	});

	return router;
}

module.exports = api;
