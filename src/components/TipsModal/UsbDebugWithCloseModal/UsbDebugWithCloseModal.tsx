import React, { SFC, memo } from 'react';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import { withModeButton } from '@src/components/enhance';
import debugModeImg from './images/debug_mode.png';
import './UsbDebugWithCloseModal.less';

const ModeButton = withModeButton()(Button);

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 确定Handle
     */
    okHandle: () => void;
}

/**
 * 提示窗，提醒用户开启USB调试
 * @param props 
 */
const UsbDebugWithCloseModal: SFC<Prop> = (props) => <Modal
    visible={props.visible}
    centered={true}
    footer={[
        <ModeButton type="primary"
            icon="check-circle"
            onClick={() => props.okHandle()}>
            确定
        </ModeButton>
    ]}
    width={1000}
    maskClosable={false}
    closable={false}>
    <div className="usb-debug-with-close-modal">
        <div className="img">
            <img src={debugModeImg} />
        </div>
    </div>
</Modal>;

export default memo(UsbDebugWithCloseModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);