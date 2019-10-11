import React, { Component, ReactElement } from 'react';
import { Modal } from 'antd';

interface IProp {
    visible: boolean;
    cancelHandle?: () => void;
}
interface IState {
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
            cancelText="取消"
            onCancel={this.props.cancelHandle}>
        </Modal>
    }
}
export default DetailModal;