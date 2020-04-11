import React, { SFC, memo } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import './IOSEncryptionModal.less';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 确定回调
     */
    okHandle?: () => void;
};

/**
 * iOS数据加密用户提示框
 */
const IOSEncryptionModal: SFC<Prop> = (props) => {

    return <div>
        <Modal
            visible={props.visible}
            onOk={props.okHandle}
            footer={[
                <Button type="primary" onClick={props.okHandle}>确定</Button>
            ]}
            okText="确定"
            closable={false}
            maskClosable={false}
            width={400}
            className="ios-encryption-modal-root"
        >
            <div className="content">
                <div className="icon-box">
                    <Icon type="warning" />
                </div>
                <div className="text-box">
                    <p><strong>数据已加密</strong></p>
                    <p>此设备iOS数据已加密</p>
                </div>
            </div>
        </Modal>
    </div>;
};

export default memo(IOSEncryptionModal);
