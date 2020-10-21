const express = require('express');
const { ipcMain } = require('electron');

/**
 * Http接口
 * @param webContents
 */
function api(webContents) {
	const router = express.Router();

	router.get('/', (req, res) => {
		res.json({
			data: 'HTTP接口',
			routes: [{ path: '/case', desc: '案件数据（解析完成&解析异常）' }]
		});
	});

	router.get('/case', (req, res) => {
		ipcMain.once('query-case-result', (event, result) => {
			res.json(result);
		});
		webContents.send('query-case');
	});

	return router;
}

module.exports = api;
