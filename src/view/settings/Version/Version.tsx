import React, { useState, useEffect, PropsWithChildren } from 'react';
import fs from 'fs';
import path from 'path';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import Skeleton from 'antd/lib/skeleton';
import logo from './images/icon.png';
import './Version.less';

interface IProp { }
interface IState {
    name: string;
    version: string;
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
                name: '安证网信数字取证',
                version: '1.0.0',
                author: 'yuet',
                description: '安证网信数字取证',
                license: 'MIT'
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
     * 渲染版本信息
     */
    function render(data: IState | null): JSX.Element {
        return <div className="version-root">
            <div className="logo">
                <img src={logo} alt="logo" width={128} height={128} />
            </div>
            <div className="info">
                <Skeleton loading={data === null} paragraph={{ rows: 2 }} active={true}>
                    <div><label>版本信息：</label><span>{data ? `v${data.version}` : ''}</span></div>
                    <div><label>作者：</label><span>{data ? data.author : ''}</span></div>
                    <div><label>产品描述：</label><span>{data ? data.description : ''}</span></div>
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