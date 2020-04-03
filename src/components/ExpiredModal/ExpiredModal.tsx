import React, { FC, MouseEvent } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import expiredPng from './images/expired.png';
import './ExpiredModal.less';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 确定按钮回调
     */
    okHandle: (e: MouseEvent<HTMLElement>) => void;
};

/**
 * 软件到期提示弹框
 */
const ExpiredModal: FC<Prop> = (props) => {

    return <Modal
        visible={props.visible}
        onOk={props.okHandle}
        footer={<Button
            type="primary"
            onClick={props.okHandle}>
            <Icon type="check-circle" />
            <span>确定</span>
        </Button>}
        title="使用到期"
        closable={false}
        maskClosable={false}>
        <div className="expired-modal-root">
            <img src={expiredPng} alt="软件到期" />
        </div>
    </Modal>;

};

export default ExpiredModal;
