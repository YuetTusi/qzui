import path from 'path';
import { execFile } from 'child_process';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { PropsWithChildren, useEffect, MouseEvent } from 'react';
import debounce from 'lodash/debounce';
import Modal from 'antd/lib/modal';
// import { Link } from 'dva/router';
import './Menu.less';
//defender.exe
interface IProp { }

/**
 * @description BCP二级菜单
 */
function Menu(props: PropsWithChildren<IProp>): JSX.Element {

    useEffect(() => {
        ipcRenderer.on('receive-publish-path', receivePublishPathHandle);
        return function () {
            ipcRenderer.removeListener('receive-publish-path', receivePublishPathHandle)
        };
    }, []);

    /**
     * 
     * @param event IPC事件对象
     * @param args 发布.asar路径
     */
    function receivePublishPathHandle(event: IpcRendererEvent, args: string) {
        runExe(path.resolve(args, '../../../tools/defender/defender.exe'));
    }

    /**
     * 运行exe文件
     * @param exePath exe文件路径
     */
    function runExe(exePath: string) {
        execFile(exePath, {
            windowsHide: false
        }, (err: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
            if (err) {
                console.log(err);
                Modal.warning({
                    title: '提示',
                    content: '口令工具启动失败'
                });
            }
        });
    }

    /**
     * 功能按钮Click事件
     */
    let buttonClick = (e: MouseEvent<HTMLAnchorElement>) => {
        ipcRenderer.send('publish-path');
    }
    buttonClick = debounce(buttonClick, 800, { leading: true, trailing: false });

    return <div className="tools-menu">
        <menu>
            <a onClick={buttonClick}>
                <li>
                    <i className="lock"></i>
                    <div className="info">
                        <span>口令工具</span>
                        <em>获取锁屏的密码</em>
                    </div>
                </li>
            </a>
        </menu>
    </div>

}

export default Menu;