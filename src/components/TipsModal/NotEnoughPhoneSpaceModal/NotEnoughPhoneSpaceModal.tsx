import React, { FC, memo } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import './NotEnoughPhoneSpaceModal.less';

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
 * 手机空间不足提示
 * @param props 
 */
const NotEnoughPhoneSpaceModal: FC<Prop> = (props) => {

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
            className="not-enough-phone-space-modal-root"
        >
            <div className="content">
                <div className="icon-box">
                    <Icon type="warning" />
                </div>
                <div className="text-box">
                    <p>手机存储空间不足，采集失败</p>
                </div>
            </div>
        </Modal>
    </div>;
};

export default memo(NotEnoughPhoneSpaceModal);
