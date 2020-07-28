const { ipcRenderer } = require('electron');
const Helper = require('./helper');

const helper = new Helper();

/**
 * 接收主进程参数
 * @param {any[]} args 参数数组
 */
ipcRenderer.on('query-db', async (event, args) => {

    let result = null;
    try {
        let [rows, total] = await queryUnit(...args);
        result = {
            data: {
                rows,
                ...total
            },
            success: true,
            error: null
        }
    } catch (error) {
        console.log(`查询出错：${error.message}`);
        result = {
            data: null,
            success: false,
            error
        }
    }
    ipcRenderer.send('query-db-result', result);
});

/**
 * 查询单位（UnitCode表）数据
 * @param {string} keyword 关键字
 * @param {number} current 当前页（从1开始）
 * @param {number} pageSize 页尺寸
 */
function queryUnit(keyword, current = 1, pageSize = 10) {

    let pageSql = 'select [PcsName],[PcsCode] from [UnitCode]';
    let totalSql = 'select count(*) as total from [UnitCode]';
    let pageSqlParams = [];
    let totalSqlParams = [];

    if (keyword) {
        pageSql += ' where [PcsName] like ? ';
        pageSqlParams.push(`%${keyword}%`);
        totalSql += ' where [PcsName] like ? ';
        totalSqlParams.push(`%${keyword}%`);
    }

    pageSql += ' limit ? offset ? ';
    pageSqlParams.push(pageSize);
    pageSqlParams.push((current - 1) * pageSize);

    return Promise.all([
        helper.query(pageSql, pageSqlParams),
        helper.scalar(totalSql, totalSqlParams)
    ]);
}