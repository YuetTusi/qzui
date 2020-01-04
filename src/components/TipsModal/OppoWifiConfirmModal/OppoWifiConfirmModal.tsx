import React, { PropsWithChildren } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
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
            <div className="info">请确认前面已经没有待连接WIFI 进行采集的手机！</div>
            <div className="promp">
                <img src="https://img10.360buyimg.com/n1/s200x200_jfs/t1/48459/37/9504/569689/5d6f48a9Ebf7c67bc/af4fc49ebc5d982a.jpg" />
            </div>
        </div>
    </Modal>;
}

export default OppoWifiConfirmModal;