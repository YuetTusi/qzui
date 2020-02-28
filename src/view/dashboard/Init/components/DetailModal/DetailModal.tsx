import React, { Component, MouseEvent } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import Modal from 'antd/lib/modal';
import Icon from 'antd/lib/icon';
import { SystemType } from '@src/schema/SystemType';
import { DetailMessage } from '@src/type/DetailMessage';
import { ConnectSate } from '@src/schema/ConnectState';
import './DetailModal.less';

interface Prop {
    /**
     * 隐藏/显示详情框
     */
    visible: boolean;
    /**
     * 详情实时数据
     */
    message: DetailMessage;
    /**
     * 取消回调
     */
    cancelHandle?: (event: MouseEvent<HTMLElement>) => void;
}
interface State {
    /**
     * 隐藏/显示详情框
     */
    visible: boolean;
    /**
     * 反馈消息
     */
    message: DetailMessage | null;
}

/**
 * 采集详情弹框
 */
class DetailModal extends Component<Prop, State> {
    constructor(props: Prop) {
        super(props);
        this.state = {
            visible: false,
            message: null
        }
    }
    componentDidMount() {
        //主进程反馈监听
        ipcRenderer.on('receive-collecting-detail', this.receiveCollectingDetailHandle);
    }
    componentWillReceiveProps(nextProp: Prop) {
        this.setState({
            visible: nextProp.visible,
            message: nextProp.message
        });
    }
    componentWillUnmount() {
        //清除订阅
        ipcRenderer.removeListener('receive-collecting-detail', this.receiveCollectingDetailHandle);
    }
    /**
     * 接收采集详情数据
     */
    receiveCollectingDetailHandle = (event: IpcRendererEvent, args: string) => {
        this.setState({
            message: JSON.parse(args)
        });
    }
    /**
     * 渲染手机图像
     */
    renderIcon = () => {
        const { message } = this.state;
        if (message === null) {
            return <Icon type="sync" spin={true} className="sync" />;
        } else if (message.m_spif.m_ConnectSate === ConnectSate.FETCHEND) {
            return <Icon type="check-circle" spin={false} className="check-circle" />;
        } else {
            return <Icon type="sync" spin={true} className="sync" />;
        }
    }
    /**
     * 渲染手机图class样式
     */
    getPhoneClassName = () => {
        const { message } = this.state;
        if (message === null) {
            return 'android';
        } else if (message.m_spif.piSystemType === SystemType.IOS) {
            return 'iphone';
        } else {
            return 'android';
        }
    }
    /**
     * 渲染手机详情信息
     */
    renderPhoneInfo = () => {
        const { message } = this.state;
        if (message === null) {
            return <ul>
                <li><label>品牌：</label><span></span></li>
                <li><label>型号：</label><span></span></li>
                <li><label>序列号：</label><div></div></li>
                <li><label>物理USB端口号：</label><div></div></li>
            </ul>;
        } else {
            return <ul>
                <li><label>品牌：</label><span>{message.m_spif.piBrand}</span></li>
                <li><label>型号：</label><span>{message.m_spif.piModel}</span></li>
                <li><label>序列号：</label><div>{message.m_spif.piSerialNumber}</div></li>
                <li><label>物理USB端口号：</label><div>{message.m_spif.piLocationID}</div></li>
            </ul>;
        }
    }
    /**
     * 渲染采集状态
     */
    renderMessage = () => {
        const { message } = this.state;
        if (message === null) {
            return <div className="tip">
                <strong className="fetching">正在采集数据...</strong>
                <div className="now">
                    <div>正在读取采集进度...</div>
                </div>
            </div>;
        } else if (message.m_spif.m_ConnectSate === ConnectSate.FETCHEND) {
            return <div className="tip">
                <strong className="finish">取证完成</strong>
                <div className="now">
                    <div></div>
                </div>
            </div>;
        } else {
            return <div className="tip">
                <strong className="fetching">正在采集数据...</strong>
                <div className="now">
                    <div>{message.m_strDescription}</div>
                </div>
            </div>;
        }
    }
    render(): JSX.Element {
        return <Modal
            title="取证详情"
            visible={this.state.visible}
            width={800}
            okButtonProps={{ style: { display: 'none' } }}
            cancelText="取消"
            cancelButtonProps={{ icon: 'close-circle' }}
            onCancel={this.props.cancelHandle}>
            <div className="detail-modal-root">
                <div className="col">
                    <div className="panel">
                        <div className="title">
                            <Icon type="mobile" />
                            <span>设备</span>
                        </div>
                        <div className="row-content">
                            <div className="left">
                                <i className={`phone-type ${this.getPhoneClassName()}`}>
                                    {this.renderIcon()}
                                </i>
                            </div>
                            <div className="right">
                                {this.renderPhoneInfo()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="panel">
                        <div className="title">
                            <Icon type="file-sync" />
                            <span>采集状态</span>
                        </div>
                        <div className="col-content">
                            {this.renderMessage()}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    }
}
export default DetailModal;