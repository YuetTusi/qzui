import React, { PropsWithChildren } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import OppoImg from './images/oppo_wifi_steps.jpg';
import './OppoWifiConfirmModal.less';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 是按钮回调
     */
    okHandle: () => void;
    /**
     * 否按钮回调
     */
    cancelHandle: () => void;
}

/**
 * OPPO_WiFi采集确认提示框
 * @param props 属性
 */
function OppoWifiConfirmModal(props: PropsWithChildren<Prop>): JSX.Element {
    return <Modal
        visible={props.visible}
        closable={false}
        maskClosable={false}
        width={1210}
        footer={[
            <Button
                type="default"
                icon="close-circle"
                onClick={() => props.cancelHandle()}>
                <span>否</span>
            </Button>,
            <Button
                type="primary"
                icon="check-circle"
                onClick={() => props.okHandle()}>
                <span>是</span>
            </Button>
        ]}>
        <div className="oppo-wifi-confirm-modal">
            <div className="info">请确认<em>前面</em>已经<strong>没有</strong>待连接WIFI 进行采集的手机！</div>
            <div className="promp">
                <img src={OppoImg} />
            </div>
        </div>
    </Modal>;
}

export default OppoWifiConfirmModal;