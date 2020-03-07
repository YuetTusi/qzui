import React, { PropsWithChildren, ReactElement } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Divider from 'antd/lib/divider';
import confirmImg from './images/hisuite_confirm.png';
import './HisuiteFetchConfirmModal.less';

interface IProp {
    visible: boolean;
    //确定回调
    okHandle: () => void;
}

/**
 * Hisuite连接确认提示框
 * @param props 
 */
function HisuiteFetchConfirmModal(props: PropsWithChildren<IProp>): ReactElement {

    return <Modal visible={props.visible}
        centered={true}
        footer={[
            <Button
                type="primary"
                icon="check-circle"
                onClick={() => props.okHandle()}>
                确定
            </Button>
        ]}
        maskClosable={false}
        closable={true}
        width={500}>
        <div className="hisuite-modal-root">
            <div className="title">
                请允许
            </div>
            <Divider />
            <div className="content">
                <h3>请点击连接，允许连接手机助手客户端</h3>
                <img src={confirmImg} alt="手机助手" />
            </div>
        </div>
    </Modal>
}

export default HisuiteFetchConfirmModal;