import fs from 'fs';
import path from 'path';
import ini from 'ini';
import nunjucks from 'nunjucks';
import { remote } from 'electron';
import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Skeleton from 'antd/lib/skeleton';
import logo from './images/icon.png';
import { useMount } from '@src/hooks';
import Db from '@src/utils/Db';
import localStore from '@src/utils/localStore';
import { helper } from '@src/utils/helper';
import { HistoryKeys } from '@utils/userHistory';
import { template } from './template';
import './Version.less';

const config = helper.readConf();

interface Prop { }
interface State {
    name: string;
    version: string;
    date: string;
    author: string;
    description: string;
    license: string;
    publishHtml: string;
}

/**
 * 版本信息
 * @param props 
 */
const Version: FC<Prop> = (props) => {

    let [info, setInfo] = useState<State | null>(null);
    let [publishModalVisible, setPublishModalVisible] = useState<boolean>(false);
    let [disabled, setDisabled] = useState<boolean>(false);

    useMount(() => {
        const appPath = remote.app.getAppPath();
        const packagePath = path.join(appPath, 'package.json');
        const versionPath = process.env.NODE_ENV === 'development' ? path.join(appPath, 'info.dat') : path.join(appPath, '../../info.dat')
        Promise.all([
            readFile(packagePath),
            readFile(versionPath)
        ]).then(([npmPackage, version]) => {
            return [JSON.parse(npmPackage), ini.parse(version)];
        }).then(([packageObj, versionList]) => {
            versionList = Object.entries(versionList);
            let publishHtml = nunjucks.renderString(template, { logs: versionList });
            let [, detail] = Object.entries<any>(versionList)[0];
            setDisabled(false);
            setInfo({
                name: packageObj.name,
                date: detail.Date,
                publishHtml,
                version: versionList[0][0],
                author: config.author,
                description: config.title,
                license: 'MIT'
            });
        }).catch((err) => {
            console.log(err);
            setDisabled(true);
            setInfo({
                name: 'qzui',
                date: '',
                publishHtml: '',
                version: 'v0.0.1',
                author: config.author,
                description: config.title,
                license: 'MIT'
            });
        });
    });

    /**
     * 渲染版本信息
     */
    const render = (data: State | null) => {
        return <div className="version-root">
            <div className="logo">
                <img src={logo} alt="logo" width={293} height={218} onDoubleClick={() => {
                }} />
            </div>
            <div className="info">
                <Skeleton loading={data === null} paragraph={{ rows: 2 }} active={true}>
                    <div><label>产品描述</label><span>{data ? data.description : ''}</span></div>
                    <div><label>开发者</label><span>{data ? data.author : ''}</span></div>
                    <div><label>版本号</label><span>{data ? data.version.replace(/\-/g, '.') : ''}</span></div>
                    <div style={{ padding: 0 }}>
                        <label>发行日志</label>
                        <span>
                            <Button
                                type="link"
                                disabled={disabled}
                                style={{ padding: 0 }}
                                onClick={() => setPublishModalVisible(true)}>查看</Button>
                        </span>
                    </div>
                </Skeleton>
            </div>
            <Modal
                visible={publishModalVisible}
                footer={[
                    <Button
                        type="primary"
                        icon={'check-circle'}
                        onClick={() => setPublishModalVisible(false)}>确定</Button>
                ]}
                title="发行日志"
                centered={true}
                closable={false}
                width={1050}
                destroyOnClose={true}
                maskClosable={false}
                className="publish-modal-root">
                <div dangerouslySetInnerHTML={{ __html: info?.publishHtml! }}></div>
            </Modal>
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