import QRCode from 'qrcode';
import React, { FC, useEffect } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import './ScanModal.less';

/**
 * 二维码扫描窗口
 */
const ScanModal: FC<{
    visible: boolean,
    caseId: string,
    ip: string,
    cancelHandle: () => void

}> = ({ visible, caseId, ip, cancelHandle }) => {

    useEffect(() => {
        if (visible) {
            console.log(ip);
            (async () => {
                try {
                    await QRCode.toCanvas(document.getElementById('qrcode'), `http://${ip}:9900/check/${caseId}`, {
                        width: 360,
                        margin: 2,
                        color: {
                            dark: '#34578f'
                        }
                    });
                } catch (error) {
                    console.log(error);
                    message.warn('创建二维码失败');
                }
            })();
        }
    }, [visible]);

    return <Modal
        footer={[
            <Button
                onClick={cancelHandle}
                icon="close-circle"
                type="default">取消</Button>
        ]}
        onCancel={cancelHandle}
        visible={visible}
        centered={true}
        destroyOnClose={true}
        maskClosable={false}
        forceRender={true}
        title="快速点验">
        <div className="scan-modal-root">
            <p>请在当前网络下扫描下方二维码安装APK</p>
            <canvas width="320" height="320" id="qrcode" />
        </div>
    </Modal>
};

export default ScanModal;