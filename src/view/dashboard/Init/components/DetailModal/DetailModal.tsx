import React, { Component, ReactElement, MouseEvent } from 'react';
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
}

/**
 * 采集详情弹框
 */
class DetailModal extends Component<IProp, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            visible: false
        }
    }
    componentWillReceiveProps(nextProp: IProp) {
        this.setState({ visible: nextProp.visible });
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
        </Modal>
    }
}
export default DetailModal;