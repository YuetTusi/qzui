import path from 'path';
import { execFile } from 'child_process';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { PropsWithChildren, useEffect, useState, MouseEvent } from 'react';
// import { Link } from 'dva/router';
import debounce from 'lodash/debounce';
import Modal from 'antd/lib/modal';
import Spin from 'antd/lib/spin';
import ImportDataModal from './ImportDataModal/ImportDataModal';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import config from '@src/config/ui.config.json';
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

    let [isLoading, setLoading] = useState<boolean>(false);
    let [importDataModalVisible, setImportDataModalVisible] = useState<boolean>(false);

    /**
     * 
     * @param event IPC事件对象
     * @param args 发布.asar路径
     */
    function receivePublishPathHandle(event: IpcRendererEvent, args: string) {
        const { defenderPath } = config as any;
        runExe(path.resolve(args, '../../../', defenderPath));
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
     * 第三方导入弹框保存回调
     * @param data 案件数据
     */
    function importDataModalSaveHandle(data: CFetchDataInfo) {
        console.log(data);
    }

    /**
     * 第三方导入弹框取消回调
     */
    function importDataModalCancelHandle() {
        setImportDataModalVisible(false);
    }

    /**
     * 功能按钮Click事件
     */
    let buttonClick = (e: MouseEvent<HTMLAnchorElement>) => {
        ipcRenderer.send('publish-path');
        setLoading(true);
        setTimeout(() => setLoading(false), 2048);
    }
    buttonClick = debounce(buttonClick, 800, { leading: true, trailing: false });

    return <div className="tools-menu">
        <menu>
            <li>
                <Spin tip="正在打口令工具, 请稍候..." spinning={isLoading}>
                    <a onClick={buttonClick}>
                        <i className="lock"></i>
                        <div className="info">
                            <span>口令工具</span>
                            <em>获取锁屏密码</em>
                        </div>
                    </a>
                </Spin>
            </li>
            <li>
                <a onClick={() => Modal.info({ title: 'BCP生成', content: '新功能，敬请期待', okText: '确定' })}>
                    <i className="bcp"></i>
                    <div className="info">
                        <span>BCP生成</span>
                        <em>将报告文件生成BCP文件</em>
                    </div>
                </a>
            </li>
            <li>
                <a onClick={() => Modal.info({ title: 'BCP上传', content: '新功能，敬请期待', okText: '确定' })}>
                    <i className="upload"></i>
                    <div className="info">
                        <span>BCP上传</span>
                        <em>将案件上传到指定FTP服务器</em>
                    </div>
                </a>
            </li>
            <li>
                <a onClick={() => Modal.info({ title: '报告生成', content: '新功能，敬请期待', okText: '确定' })}>
                    <i className="report"></i>
                    <div className="info">
                        <span>报告生成</span>
                        <em>将案件生成HTML报告</em>
                    </div>
                </a>
            </li>
            <li>
                <a onClick={() => setImportDataModalVisible(true)}>
                    <i className="indata"></i>
                    <div className="info">
                        <span>导入数据</span>
                        <em>导入第三方数据进行解析</em>
                    </div>
                </a>
            </li>
        </menu>
        <ImportDataModal
            visible={importDataModalVisible}
            saveHandle={importDataModalSaveHandle}
            cancelHandle={importDataModalCancelHandle} />
    </div>

}

export default Menu;