import React, { PropsWithChildren } from 'react';
import Modal from 'antd/lib/modal';
import Divider from 'antd/lib/divider'
import './SamsungSmartSwitchModal.less';
import samsung1 from './images/samsung_1.jpg';
import samsung2 from './images/samsung_2.jpg';

interface IProp {
    /**
     * 是否显示
     */
    visible: boolean;
}

/**
 * 三星助手提示弹框
 */
function SamsungSmartSwitchModal(props: PropsWithChildren<IProp>): JSX.Element {
    return <Modal
        visible={props.visible}
        width={670}
        centered={true}
        footer={null}
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

export default SamsungSmartSwitchModal;