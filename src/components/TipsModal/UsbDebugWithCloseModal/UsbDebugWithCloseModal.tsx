import React, { PropsWithChildren, FC } from 'react';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import usbImg1 from './images/usb_1.png';
import usbImg2 from './images/usb_2.png';
import './UsbDebugWithCloseModal.less';

interface IProp {
    visible: boolean;
    okHandle: () => void;
}

/**
 * 提示窗，提醒用户开启USB调试
 * @param props 
 */
function UsbDebugWithCloseModal(props: PropsWithChildren<IProp>): JSX.Element {

    return <Modal
        visible={props.visible}
        centered={true}
        footer={[
            <Button type="primary"
                icon="check-circle"
                onClick={() => props.okHandle()}>
                确定
            </Button>
        ]} width={800}
        maskClosable={false}
        closable={false}>
        <div className="usb-modal-root">
            <div>
                <div><span className="title">请在手机上打开调试模式</span></div>
            </div>
            <div>
                <div className="qus"><em>如何开启USB调试模式？</em></div>
                <ol>
                    <li>保证USB调试、USB安装为开启状态</li>
                    <li>请勾选一律允许使用这台计算机进行调试</li>
                    <li>如手机未弹出“允许USB调试？”尝试插拔手机</li>
                    <li>部分手机允许USB调试后如仍连接不上，需要重新拔插并切换到文件传输模式</li>
                </ol>
            </div>
            <div className="img">
                <img src={usbImg1} />
                <img src={usbImg2} />
            </div>
        </div>
    </Modal>
}

export default UsbDebugWithCloseModal;