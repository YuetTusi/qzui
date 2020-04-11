import React, { SFC, memo } from 'react';
import Modal from 'antd/lib/modal';
import Divider from 'antd/lib/divider';
import Button from 'antd/lib/button';
import promptImg from './images/prompt.png';
import './PromptModal.less';

interface Prop {
    //是否显示
    visible: boolean;
    //确定回调
    okHandle: () => void;
}

/**
 * 数据提取提示框
 */
const PromptModal: SFC<Prop> = (props) => <Modal
    footer={[
        <Button type="primary"
            icon="check-circle"
            onClick={() => props.okHandle()}>
            确定
        </Button>
    ]}
    visible={props.visible}
    centered={true}
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
            </div>
        </div>
    </div>
</Modal>

export default memo(PromptModal);