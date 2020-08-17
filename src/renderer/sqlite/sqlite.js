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

ipcRenderer.on('query-bcp-conf', async (event, args) => {

    try {
        let row = await queryBcpConf();
        result = {
            data: {
                row
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
    // ipcRenderer.send('query-db-result', result);
    ipcRenderer.send('query-bcp-conf-result',result);
});

ipcRenderer.on('update-bcp-conf', async (event, args) => {
    try {
        let success = await updateBcpConf(args);
        result = {
            data: {
                success
            },
            success: true,
            error: null
        }
    } catch (error) {
        console.log(`更新出错：${error.message}`);
        result = {
            data: null,
            success: false,
            error
        }
    }
    ipcRenderer.send('update-bcp-conf-result', result);
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

/**
 * 查询BCP配置表（BcpConf表）数据
 */
function queryBcpConf() {

    let sql = 'select * from [BcpConf]';

    return helper.scalar(sql);
}

/**
 * 更新BcpConf表数据
 * @param params 
 */
function updateBcpConf(params) {

    const sql = `update [BcpConf] 
    set 
    manufacturer=?,security_software_orgcode=?,materials_name=?,
    materials_model=?,materials_hardware_version=?,
    materials_software_version=?,materials_serial=?,ip_address=?
    where id=?`;

    return helper.execute(sql, params);
}