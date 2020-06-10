import React, { SFC, memo } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Divider from 'antd/lib/divider';
import confirmImg from './images/hisuite_confirm.png';
import './HisuiteFetchConfirmModal.less';

interface Prop {
    //是否显示
    visible: boolean;
    //确定回调
    okHandle: () => void;
}

/**
 * Hisuite连接确认提示框
 * @param props 
 */
const HisuiteFetchConfirmModal: SFC<Prop> = (props) => {
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
        closable={false}
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

export default memo(HisuiteFetchConfirmModal);