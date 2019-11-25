import React, { Component, ReactElement, MouseEvent, JSXElementConstructor } from 'react';
import { ipcRenderer, IpcMessageEvent } from 'electron';
import { Modal, Icon } from 'antd';
import './DetailModal.less';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';

interface IProp {
    /**
     * 隐藏/显示详情框
     */
    visible: boolean;
    /**
     * 取消回调
     */
    cancelHandle?: (event: MouseEvent<HTMLElement>) => void;
}
interface IState {
    /**
     * 隐藏/显示详情框
     */
    visible: boolean;
    message: IMessage | null;
}

/**
 * 采集详情消息对象
 */
interface IMessage {
    m_spif: stPhoneInfoPara;
    m_strDescription: string;
}

/**
 * 采集详情弹框
 */
class DetailModal extends Component<IProp, IState> {
    constructor(props: IProp) {
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
    componentWillReceiveProps(nextProp: IProp) {
        this.setState({ visible: nextProp.visible });
    }
    componentWillUnmount() {
        //清除订阅
        ipcRenderer.removeListener('receive-collecting-detail', this.receiveCollectingDetailHandle);
    }
    /**
     * 接收采集详情数据
     */
    receiveCollectingDetailHandle = (event: IpcMessageEvent, args: string) => {
        this.setState({
            message: JSON.parse(args)
        });
    }
    renderIcon = () => {
        const { message } = this.state;
        if (message === null) {
            return <Icon type="sync" spin={true} className="sync" />;
        } else if (message.m_spif.m_ConnectSate === 3) {
            return <Icon type="check-circle" spin={false} className="check-circle" />;
        } else {
            return <Icon type="sync" spin={true} className="sync" />;
        }
    }
    renderPhoneInfo = () => {
        const { message } = this.state;
        if (message) {
            return <ul>
                <li><label>品牌：</label><span>{message.m_spif.piMakerName}</span></li>
                <li><label>型号：</label><span>{message.m_spif.piPhoneType}</span></li>
                <li><label>序列号：</label><div>{message.m_spif.piSerialNumber}</div></li>
                <li><label>物理USB端口号：</label><div>{message.m_spif.piLocationID}</div></li>
            </ul>;
        } else {
            return <ul>
                <li><label>品牌：</label><span></span></li>
                <li><label>型号：</label><span></span></li>
                <li><label>序列号：</label><div></div></li>
                <li><label>物理USB端口号：</label><div></div></li>
            </ul>;
        }
    }
    renderMessage = () => {
        const { message } = this.state;
        if (message === null) {
            return <div className="tip">
                <strong className="fetching">正在拉取数据...</strong>
                <div className="now"></div>
            </div>;
        } else if (message.m_spif.m_ConnectSate === 3) {
            return <div className="tip">
                <strong className="finish">采集完成</strong>
                <div className="now">
                    <div>{this.state.message!.m_strDescription}</div>
                </div>
            </div>;
        } else {
            return <div className="tip">
                <strong className="fetching">正在拉取数据...</strong>
                <div className="now">
                    <div>{this.state.message!.m_strDescription}</div>
                </div>
            </div>;
        }
    }
    render(): ReactElement {
        return <Modal
            title="取证详情"
            visible={this.state.visible}
            width={800}
            okButtonProps={{ style: { display: 'none' } }}
            cancelText="取消"
            cancelButtonProps={{ icon: 'stop' }}
            onCancel={this.props.cancelHandle}>
            <div className="detail-modal-root">
                <div className="col">
                    <div className="panel">
                        <div className="title">设备</div>
                        <div className="row-content">
                            <div className="left">
                                <i className="phone-type android">
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
                        <div className="title">采集状态</div>
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