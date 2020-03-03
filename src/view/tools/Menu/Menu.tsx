import path from 'path';
import { execFile } from 'child_process';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { FC, useEffect, useState, MouseEvent } from 'react';
import { rpc } from '@src/service/rpc';
import config from '@src/config/ui.config.json';
import Modal from 'antd/lib/Modal';
import Spin from 'antd/lib/spin';
import message from 'antd/lib/message';
import ImportDataModal from './components/ImportDataModal/ImportDataModal';
import CImportDataInfo from '@src/schema/CFetchDataInfo';
import './Menu.less';

interface Prop { }

let publishPath: string = '';

/**
 * 工具箱菜单
 * @param props 属性
 */
const Menu: FC<Prop> = (props) => {

    const [isLoading, setLoading] = useState<boolean>(false);
    const [importDataModalVisible, setImportDataModalVisible] = useState<boolean>(false);

    useEffect(() => {
        ipcRenderer.on('receive-publish-path', receivePublishPathHandle);
        ipcRenderer.send('publish-path');
        return function () {
            ipcRenderer.removeListener('receive-publish-path', receivePublishPathHandle);
        }
    }, []);

    /**
     * 取得发布目录
     * @param event IPC事件对象
     * @param args 发布路径(*.asar文件)
     */
    const receivePublishPathHandle = (event: IpcRendererEvent, args: string) => {
        publishPath = args;
    };
    /**
     * 运行exe文件
     * @param exePath 绝对路径
     */
    const runExe = (exePath: string) => {
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
     * 口令工具Click
     * @param e 事件对象
     */
    const passwordToolsClick = (e: MouseEvent<HTMLAnchorElement>) => {
        const { defenderPath } = config as any;
        runExe(path.resolve(publishPath, '../../../', defenderPath));
    }

    /**
     * 报告生成Click
     * @param e 事件
     */
    // const reportClick = (e: MouseEvent<HTMLAnchorElement>) => {
    //     const { readerPath } = config as any;
    //     runExe(path.resolve(publishPath, '../../../', readerPath));
    // }

    /**
     * 导入第三方数据回调
     * @param data CImportDataInfo数据
     */
    const importDataModalSaveHandle = (data: CImportDataInfo) => {
        setLoading(true);
        rpc.invoke('ImportThirdData', [data]).then(() => {
            message.success('导入成功');
            setImportDataModalVisible(false);
        }).catch((err: Error) => {
            message.error('导入失败');
        }).finally(() => {
            setLoading(false);
        });
    }
    /**
     * 关闭导入弹框
     */
    const importDataModalCancelHandle = () => {
        setImportDataModalVisible(false);
    }

    return <div className="tools-menu">
        <menu>
            <li>
                <Spin tip="正在打口令工具, 请稍候..." spinning={false}>
                    <a onClick={passwordToolsClick}>
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
            {/* <li>
                <a onClick={reportClick}>
                    <i className="report"></i>
                    <div className="info">
                        <span>报告生成</span>
                        <em>将案件生成HTML报告</em>
                    </div>
                </a>
            </li> */}
            <li>
                <a onClick={() => setImportDataModalVisible(true)}>
                    <i className="indata"></i>
                    <div className="info">
                        <span>导入数据</span>
                        <em>导入第三方数据进行解析</em>
                    </div>
                </a>
            </li>
            <li>
                <a onClick={() => Modal.info({ title: '华为高级采集工具', content: '新功能，敬请期待', okText: '确定' })}>
                    <i className="huawei"></i>
                    <div className="info">
                        <span>华为高级采集工具</span>
                        <em></em>
                    </div>
                </a>
            </li>
        </menu>
        <ImportDataModal
            isLoading={isLoading}
            visible={importDataModalVisible}
            saveHandle={importDataModalSaveHandle}
            cancelHandle={importDataModalCancelHandle} />
    </div>;
}

export default Menu;