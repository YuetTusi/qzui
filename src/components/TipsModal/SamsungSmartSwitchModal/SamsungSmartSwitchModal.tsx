import React, { SFC, memo } from 'react';
import Modal from 'antd/lib/modal';
import Divider from 'antd/lib/divider';
import Button from 'antd/lib/button';
import samsung1 from './images/samsung_1.jpg';
import samsung2 from './images/samsung_2.jpg';
import './SamsungSmartSwitchModal.less';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 确定回调
     */
    okHandle: () => void;
}

/**
 * 三星助手提示弹框
 */
const SamsungSmartSwitchModal: SFC<Prop> = (props) => {
    return <Modal
        footer={[
            <Button type="primary"
                icon="check-circle"
                onClick={() => props.okHandle()}>
                确定
            </Button>
        ]}
        visible={props.visible}
        width={670}
        centered={true}
        maskClosable={false}
        closable={false}>
        <div className="samsung-smart-switch-modal">
            <div className="info">
                <div>弹出请一律选择 <em>“允许”</em></div>
                <Divider />
            </div>
            <div className="photo">
                <img src={samsung1} height="560" />
                <img src={samsung2} height="560" />
            </div>
        </div>
    </Modal>
}

export default memo(SamsungSmartSwitchModal);