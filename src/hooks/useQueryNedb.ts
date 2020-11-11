import { remote } from 'electron';
import { useEffect, useState } from 'react';


const getDb = remote.getGlobal('getDb');

/**
 * 查询本地NeDB数据库
 * @param {TableName} tableName 表名
 * @param {any} condition 查询条件
 */
function useQueryDb(tableName: string, condition: any = null) {

    const db = getDb(tableName);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        (async function () {
            let data = await db.find(condition);
            setResult(data);
        })();
    }, []);

    return result;
}

export { useQueryDb };