import React, { Component, ReactElement, MouseEvent } from 'react';
import { ipcRenderer, IpcMessageEvent } from 'electron';
import { Modal } from 'antd';

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
    test: any;
}

/**
 * 采集详情弹框
 */
class DetailModal extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
        this.state = {
            visible: false,
            test: null
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
    receiveCollectingDetailHandle = (event: IpcMessageEvent, args: any) => {
        this.setState({
            test: args
        });
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
            <h1>{this.state.test}</h1>
        </Modal>
    }
}
export default DetailModal;