import React, { useState, useEffect, PropsWithChildren } from 'react';
import fs from 'fs';
import path from 'path';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import Skeleton from 'antd/lib/skeleton';
import logo from './images/icon.png';
import Db from '@src/utils/Db';
import './Version.less';

interface IProp { }
interface IState {
    name: string;
    version: string;
    electronVersion: string;
    author: string;
    description: string;
    license: string;
}

/**
 * 版本信息
 * @param props 
 */
function Version(props: PropsWithChildren<IProp>): JSX.Element {

    let [pkg, setPkg] = useState<IState | null>(null);
    let [num, setNum] = useState<number>(0);

    useEffect(() => {
        ipcRenderer.send('publish-path');
        ipcRenderer.on('receive-publish-path', receiveHandle);
        return () => {
            ipcRenderer.removeListener('receive-publish-path', receiveHandle)
        };
    }, []);

    /**
     * 主进程发布路径接收事件Handle
     * @param event IPC事件
     * @param args 主进程返回的结果（发布路径）
     */
    function receiveHandle(event: IpcRendererEvent, args: any) {
        if (process.env.NODE_ENV === 'development') {
            setTimeout(() => setPkg({
                name: 'N次方多路取证塔',
                version: '1.0.0',
                electronVersion: '8.2.0',
                author: 'CuiYue, CaiChengji, ChenSilu, GengWanbao, HuLijun, DingWeijia',
                description: '北京万盛华通科技有限公司',
                license: 'Mozilla'
            }), 1000);
        } else {
            let packagePath = path.join(args, 'package.json');
            readFile(packagePath).then((data: string) => {
                return JSON.parse(data);
            }).then((json: IState) => {
                setPkg(json);
            }).catch((err: Error) => {
                console.log(err);
            });
        }
    }

    /**
     * 清空集合中的所有数据
     * @param collectionName 集合名称
     */
    function clearCollection(collectionName: string[]): Promise<any>[] {
        if (collectionName.length === 0) {
            throw new Error('集合为空');
        } else {
            return collectionName.map((collection: string) => new Db<any>(collection).remove({}, true));
        }
    }

    /**
     * 渲染版本信息
     */
    function render(data: IState | null): JSX.Element {
        return <div className="version-root">
            <div className="logo">
                <img src={logo} alt="logo" width={293} height={218} onDoubleClick={() => {
                    console.clear();
                    console.log(num);
                    if (num === 5) {
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
                    <div><label>版本信息：</label><span>{data ? `v${data.version}` : ''}</span></div>
                    <div><label>electron：</label><span>{data ? `v${data.electronVersion}` : ''}</span></div>
                    <div><label>产品描述：</label><span>{data ? data.description : ''}</span></div>
                    <div><label>开发者：</label><span>{data ? data.author : ''}</span></div>
                </Skeleton>
            </div>
        </div>
    }

    return render(pkg);
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