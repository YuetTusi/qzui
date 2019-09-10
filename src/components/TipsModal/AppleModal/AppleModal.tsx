import React, { PropsWithChildren, ReactElement } from 'react';
import { Modal, Divider } from 'antd';
import debugImg from './images/debug.jpg';
import './AppleModal.less';

interface IProp {
    visible: boolean;
}

/**
 * Apple信任提示框
 * @param props 
 */
function AppleModal(props: PropsWithChildren<IProp>): ReactElement {

    return <Modal visible={props.visible}
        centered={true}
        footer={null}
        maskClosable={false}
        closable={false}
        width={500}>
        <div className="apple-modal-root">
            <div className="title">
                信任授权
            </div>
            <Divider />
            <div className="content">
                <h3>请点击屏幕上的信任按钮</h3>
                <img src={debugImg} alt="iPhone信任" />
            </div>
        </div>
    </Modal>
}

export default AppleModal;