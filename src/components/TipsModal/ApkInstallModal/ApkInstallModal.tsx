import React, { PropsWithChildren, ReactElement } from 'react';
import { Modal, Divider } from 'antd';
import installImg from './images/install.png';
import './ApkInstallModal.less';

interface IProp {
    visible: boolean;
}

/**
 * 采集APK安装提示
 * @param props 
 */
function ApkInstallModal(props: PropsWithChildren<IProp>): ReactElement {

    return <Modal visible={props.visible}
        centered={true}
        footer={null}
        maskClosable={false}
        closable={false}
        width={1000}>
        <div className="apk-install-modal">
            <div className="title">APK安装提示</div>
            <Divider />
            <div className="content">
                <img src={installImg} />
                <div>
                    <ol>
                        <li>请保持手机屏幕是解锁状态</li>
                        <li>安装提示框, 请点击继续安装</li>
                        <li>若没有弹框提示,您可以打开设置 -> 更多设置->开发者选项-><strong>允许USB安装</strong></li>
                    </ol>
                </div>
            </div>
        </div>
    </Modal>
}
export default ApkInstallModal;