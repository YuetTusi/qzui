import path from 'path';
import { execFile } from 'child_process';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { Component, PropsWithChildren, useEffect, useState, MouseEvent } from 'react';
import Rpc from '@src/service/rpc';
// import { Link } from 'dva/router';
import debounce from 'lodash/debounce';
import Modal from 'antd/lib/modal';
import Spin from 'antd/lib/spin';
import ImportDataModal from './components/ImportDataModal/ImportDataModal';
import CImportDataInfo from '@src/schema/CFetchDataInfo';
import config from '@src/config/ui.config.json';
import './Menu.less';
import { message } from 'antd';

interface IProp { }
interface IState {
    isLoading: boolean;
    importDataModalVisible: boolean;
}

class Menu extends Component<IProp, IState>{
    constructor(props: IProp) {
        super(props);
        this.state = {
            isLoading: false,
            importDataModalVisible: false
        }
    }
    componentDidMount() {
        ipcRenderer.on('receive-publish-path', this.receivePublishPathHandle);
    }
    componentWillUnmount() {
        ipcRenderer.removeListener('receive-publish-path', this.receivePublishPathHandle)
    }
    receivePublishPathHandle = (event: IpcRendererEvent, args: string) => {
        const { defenderPath } = config as any;
        this.runExe(path.resolve(args, '../../../', defenderPath));
    }
    buttonClick = (e: MouseEvent<HTMLAnchorElement>) => {
        ipcRenderer.send('publish-path');
        this.setState({
            isLoading: true
        });
        setTimeout(() => this.setState({
            isLoading: true
        }), 2048);
    }
    runExe = (exePath: string) => {
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
    importDataModalSaveHandle(data: CImportDataInfo) {
        const rpc = new Rpc();
        rpc.invoke('ImportThirdData', [data]).then(() => {
            message.success('导入成功');
            this.setState({ importDataModalVisible: false });
        }).catch((err) => {
            message.error('导入失败');
        });
    }
    importDataModalCancelHandle() {
        this.setState({ importDataModalVisible: false });
    }
    render() {
        return <div className="tools-menu">
            <menu>
                <li>
                    <Spin tip="正在打口令工具, 请稍候..." spinning={this.state.isLoading}>
                        <a onClick={this.buttonClick}>
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
                    <a onClick={() => this.setState({ importDataModalVisible: true })}>
                        <i className="indata"></i>
                        <div className="info">
                            <span>导入数据</span>
                            <em>导入第三方数据进行解析</em>
                        </div>
                    </a>
                </li>
            </menu>
            <ImportDataModal
                visible={this.state.importDataModalVisible}
                saveHandle={this.importDataModalSaveHandle}
                cancelHandle={this.importDataModalCancelHandle} />
        </div>;
    }
}

export default Menu;