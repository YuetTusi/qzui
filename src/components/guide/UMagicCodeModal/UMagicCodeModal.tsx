import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import { withModeButton } from '@src/components/enhance';
import { UMagicCodeModalProp } from './prop';
import './UMagicCodeModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 联通验证码输入框
 */
const UMagicCodeModal: FC<UMagicCodeModalProp> = ({ visible, usb, closeHandle, okHandle }) => {
	const [code, setCode] = useState<string>('');

	return (
		<Modal
			visible={visible}
			footer={[
				<ModeButton
					type="default"
					icon="close-circle"
					onClick={() => {
						closeHandle();
					}}>
					取消
				</ModeButton>
			]}
			onCancel={closeHandle}
			title="请输入连接码"
			destroyOnClose={true}
			maskClosable={false}
			closable={true}
			className="umagic-code-modal-root">
			<div className="control">
				<label>连接码：</label>
				<div className="widget">
					<Input
						placeholder="请输入连接码"
						onChange={(e) => setCode(e.target.value)}
						value={code}
					/>
					<ModeButton
						type="primary"
						onClick={() => {
							okHandle(usb, code);
							setCode('');
						}}>
						确定
					</ModeButton>
				</div>
			</div>
		</Modal>
	);
};

UMagicCodeModal.defaultProps = {
	visible: false,
	closeHandle: () => {},
	okHandle: (usb: number, code: string) => {}
};

export default UMagicCodeModal;
