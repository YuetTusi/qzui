import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import './ApplePasswordModal.less';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * USB序号
     */
    usb?: number;
    /**
     * 密码确认Handle
     */
    confirmHandle: (password: string, usb?: number) => void;
    /**
     * 不知道密码且继续Handle
     */
    withoutPasswordHandle: (usb?: number) => void;
    /**
     * 放弃Handle
     */
    cancelHandle: (usb?: number) => void;
    /**
     * 右上角关闭
     */
    closeHandle: () => void;
};

/**
 * iTunes 
 * @param props 
 */
const ApplePasswordModal: FC<Prop> = (props) => {

    const [password, setPassword] = useState<string>('');

    return <Modal
        visible={props.visible}
        footer={[
            <Button type="default" onClick={() => {
                props.cancelHandle(props.usb);
                setPassword('');
            }}>未知密码放弃</Button>,
            <Button type="primary" onClick={() => {
                props.withoutPasswordHandle(props.usb);
                setPassword('');
            }}>未知密码继续</Button>
        ]}
        onCancel={props.closeHandle}
        title="iTunes备份密码确认"
        destroyOnClose={true}
        maskClosable={false}
        closable={true}
        className="apple-password-modal-root">
        <div className="control">
            <label>密码：</label>
            <div className="widget">
                <Input onChange={(e) => setPassword(e.target.value)} value={password} />
                <Button type="primary" onClick={() => {
                    props.confirmHandle(password, props.usb);
                    setPassword('');
                }}>确定</Button>
            </div>
        </div>
    </Modal>;
};

ApplePasswordModal.defaultProps = {
    visible: false,
    confirmHandle: () => { },
    withoutPasswordHandle: () => { },
    cancelHandle: () => { },
    closeHandle: () => { }
};

export default ApplePasswordModal;
