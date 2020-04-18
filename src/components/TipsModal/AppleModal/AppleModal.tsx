import React, { PropsWithChildren, ReactElement } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Divider from 'antd/lib/divider';
import debugImg from './images/debug.jpg';
import './AppleModal.less';

interface IProp {
    visible: boolean;
    okHandle?: () => void;
}

/**
 * Apple信任提示框
 * @param props 
 */
function AppleModal(props: PropsWithChildren<IProp>): ReactElement {

    return <Modal visible={props.visible}
        footer={[
            <Button type="primary"
                icon="check-circle"
                onClick={() => {
                    if (props) {
                        props.okHandle!();
                    }
                }}>
                确定
            </Button>
        ]}
        centered={true}
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