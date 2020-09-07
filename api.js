const express = require('express');
const { ipcMain } = require('electron');

/**
 * Http接口
 * @param webContents
 */
function api(webContents) {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.json({ data: 'rootPage' });
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
