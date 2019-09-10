import React, { Component, ReactElement } from 'react';
import { Modal, Divider, Button } from 'antd';
import './PromptModal.less';
import promptImg from './images/prompt.png';

interface IProp {
    //是否显示
    visible: boolean;
}

/**
 * 数据提取提示框
 */
class PromptModal extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Modal visible={this.props.visible}
            centered={true}
            footer={null}
            maskClosable={false}
            closable={false}
            width={1000}>
            <div className="prompt-modal-root">
                <div className="title">数据提取</div>
                <Divider></Divider>
                <div className="content">
                    <img src={promptImg} />
                    <div className="txt-tips">
                        <div className="txt">
                            提取数据需要获取权限,请关注手机提示信息
                            只要出现操作提示框
                            <strong>一律点击允许操作</strong>
                            如果点击取消将无法提取信息
                        </div>
                        <div className="btn">
                            <Button type="primary" size="large">确定</Button>
                        </div>
                    </div>
                </div>
                
            </div>
        </Modal>

    }
}
export default PromptModal;