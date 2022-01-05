import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import { withModeButton } from '@src/components/enhance';
import { ApplePasswordModalProp } from './prop';
import './ApplePasswordModal.less';

const ModeButton = withModeButton()(Button);

/**
 * iTunes
 * @param props
 */
const ApplePasswordModal: FC<ApplePasswordModalProp> = ({
	visible,
	usb,
	closeHandle,
	confirmHandle,
	cancelHandle,
	withoutPasswordHandle
}) => {
	const [password, setPassword] = useState<string>('');

	return (
		<Modal
			visible={visible}
			footer={[
				<ModeButton
					type="default"
					onClick={() => {
						cancelHandle(usb);
						setPassword('');
					}}>
					未知密码放弃
				</ModeButton>,
				<ModeButton
					type="primary"
					onClick={() => {
						withoutPasswordHandle(usb);
						setPassword('');
					}}>
					未知密码继续
				</ModeButton>
			]}
			onCancel={closeHandle}
			title="iTunes备份密码确认"
			destroyOnClose={true}
			maskClosable={false}
			closable={true}
			className="apple-password-modal-root">
			<div className="control">
				<label>密码：</label>
				<div className="widget">
					<Input onChange={(e) => setPassword(e.target.value)} value={password} />
					<ModeButton
						type="primary"
						onClick={() => {
							confirmHandle(password, usb);
							setPassword('');
						}}>
						确定
					</ModeButton>
				</div>
			</div>
		</Modal>
	);
};

ApplePasswordModal.defaultProps = {
	visible: false,
	confirmHandle: () => {},
	withoutPasswordHandle: () => {},
	cancelHandle: () => {},
	closeHandle: () => {}
};

export default ApplePasswordModal;
