import { useEffect, useState } from 'react';
import Db from '@utils/db';

/**
 * 查询本地NeDB数据库
 * @param tableName 表名
 */
function useQueryDb(tableName: string, condition: any = null) {

    const db = new Db(tableName);
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