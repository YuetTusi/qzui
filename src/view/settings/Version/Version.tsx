import React, { FC, useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import Skeleton from 'antd/lib/skeleton';
import ini from 'ini';
import logo from './images/icon.png';
import Db from '@src/utils/Db';
import localStore from '@src/utils/localStore';
import { helper } from '@src/utils/helper';
import { HistoryKeys } from '@utils/userHistory';
import './Version.less';
import { pool, send } from '@src/service/tcpServer';

const config = helper.readConf();

interface Prop { }
interface State {
    name: string;
    version: string;
    date: string;
    author: string;
    description: string;
    license: string;
    items: string[];
}

/**
 * 版本信息
 * @param props 
 */
const Version: FC<Prop> = (props) => {

    let [info, setInfo] = useState<State | null>(null);
    let [num, setNum] = useState<number>(0);

    useEffect(() => {
        const appPath = remote.app.getAppPath();
        const packagePath = path.join(appPath, 'package.json');
        const versionPath = process.env.NODE_ENV === 'development' ? path.join(appPath, 'info.dat') : path.join(appPath, '../../info.dat')
        Promise.all([
            readFile(packagePath),
            readFile(versionPath)
        ]).then(([npmPackage, version]) => {
            return [JSON.parse(npmPackage), ini.parse(version)];
        }).then(([packageObj, versionList]) => {
            let [v, detail] = Object.entries<any>(versionList)[0];
            setInfo({
                name: packageObj.name,
                date: detail.Date,
                items: detail.Item,
                version: v.replace(/-/g, '.'),
                author: config.author,
                description: config.title,
                license: 'MIT'
            });
        }).catch((err) => {
            console.log(err);
            setInfo({
                name: 'qzui',
                date: '',
                items: [],
                version: 'v0.0.1',
                author: config.author,
                description: config.title,
                license: 'MIT'
            });
        });
    }, []);

    /**
     * 清空集合中的所有数据
     * @param collectionName 集合名称
     */
    const clearCollection = (collectionName: string[]) => {
        if (collectionName.length === 0) {
            throw new Error('集合为空');
        } else {
            return collectionName.map((collection: string) => new Db<any>(collection).remove({}, true));
        }
    }

    /**
     * 渲染版本信息
     */
    const render = (data: State | null) => {
        return <div className="version-root">
            <div>
                <button type="button" onClick={() => {
                    // 回复数据
                    send('fetch', { cmd: 'test', msg: 'fetch receive' });
                }}>fetch</button>
                <button type="button" onClick={() => {
                    // 回复数据
                    send('parse', { cmd: 'test', msg: 'parse receive' });
                }}>parse</button>
            </div>
            <div className="logo">
                <img src={logo} alt="logo" width={293} height={218} onDoubleClick={() => {
                    console.clear();
                    console.log(num);
                    if (num === 5) {
                        localStore.remove(HistoryKeys.HISTORY_CHECKERNAME);
                        localStore.remove(HistoryKeys.HISTORY_UNITNAME);
                        Promise.all(clearCollection(['FetchLog', 'ParseLog']))
                            .then(() => console.log('All data has deleted'))
                            .catch(() => console.log('Delete error!'));
                        setNum(0);
                    } else {
                        setNum(++num);
                    }
                }} />
            </div>
            <div className="info">
                <Skeleton loading={data === null} paragraph={{ rows: 2 }} active={true}>
                    <div><label>产品描述：</label><span>{data ? data.description : ''}</span></div>
                    <div><label>开发者：</label><span>{data ? data.author : ''}</span></div>
                    <div>
                        <label>版本信息：</label>
                        <span>{data ? data.version : ''}</span>
                    </div>
                    <div>
                        <label>发行日志（{data?.date}）：</label>
                        <ul>
                            {data?.items.slice(0, 5).map((i: string) => <li key={helper.getKey()}>{i}</li>)}
                        </ul>
                    </div>
                </Skeleton>
            </div>
        </div>
    }

    return render(info);
}

/**
 * 读取文件内容
 * @param path 文件路径
 * @return 文件内容的Promise
 */
function readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, { encoding: 'utf8' }, (err, chunk) => {
            if (err) {
                reject(err.message);
            } else {
                resolve(chunk);
            }
        });
    });
}

export default Version;