import React, { Component, MouseEvent } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import Modal from 'antd/lib/modal';
import Icon from 'antd/lib/icon';
import { SystemType } from '@src/schema/SystemType';
import './DetailModal.less';

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
    /**
     * 反馈消息
     */
    message: IMessage;
}

/**
 * 采集详情消息对象
 */
interface IMessage {
    /**
     * 序列号
     */
    piSerialNumber: string;
    /**
     * USB端口号
     */
    piLocationID: string;
    /**
     * 品牌
     */
    piBrand: string;
    /**
     * 型号
     */
    piModel: string;
    /**
     * 系统类型（Android/iOS）
     */
    piSystemType: SystemType;
    /**
     * 采集描述信息
     */
    m_strDescription: string;
    /**
     * 是否采集完成
     */
    isFinished: boolean;
}

/**
 * 采集详情弹框
 */
class DetailModal extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
        this.state = {
            visible: false,
            message: {
                piBrand: '',
                piModel: '',
                piSerialNumber: '',
                piLocationID: '',
                piSystemType: SystemType.ANDROID,
                m_strDescription: '',
                isFinished: false
            }
        }
    }
    /**
     * ?渲染优化，开发时注释掉
     */
    shouldComponentUpdate(nextProp: IProp) {
        return this.state.visible;
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
    receiveCollectingDetailHandle = (event: IpcRendererEvent, args: string) => {
        this.setState({
            message: JSON.parse(args)
        });
    }
    /**
     * 渲染品牌图标
     */
    renderIcon = () => {
        const { message } = this.state;
        if (message.isFinished) {
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
        if (message.piSystemType === SystemType.IOS) {
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
        return <ul>
            <li><label>品牌：</label><span>{message.piBrand}</span></li>
            <li><label>型号：</label><span>{message.piModel}</span></li>
            <li><label>序列号：</label><div>{message.piSerialNumber}</div></li>
            <li><label>物理USB端口号：</label><div>{message.piLocationID}</div></li>
        </ul>;
    }
    /**
     * 渲染采集状态
     */
    renderMessage = () => {
        const { message } = this.state;
        if (message.isFinished) {
            return <div className="tip">
                <strong className="finish">采集完成</strong>
                <div className="now">
                    <div>{this.state.message.m_strDescription}</div>
                </div>
            </div>;
        } else {
            return <div className="tip">
                <strong className="fetching">正在采集数据...</strong>
                <div className="now">
                    <div>{this.state.message.m_strDescription}</div>
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
                        <div className="title">设备</div>
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