import React, { FC, memo } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { withModeButton } from '@src/components/enhance';
import debugImg from './images/debug.jpg';
import './AppleModal.less';

const ModeButton = withModeButton()(Button);

interface Prop {
	visible: boolean;
	okHandle?: () => void;
}

/**
 * Apple信任提示框
 * @param props
 */
const AppleModal: FC<Prop> = ({ visible, okHandle }) => {
	return (
		<Modal
			visible={visible}
			footer={[
				<ModeButton
					type="primary"
					icon="check-circle"
					onClick={() => {
						if (okHandle) {
							okHandle();
						}
					}}>
					确定
				</ModeButton>
			]}
			centered={true}
			maskClosable={false}
			closable={false}
			width={500}>
			<div className="apple-modal-root">
				<div className="title">信任授权</div>
				<hr />
				<div className="content">
					<h3>请点击屏幕上的信任按钮</h3>
					<img src={debugImg} alt="iPhone信任" />
				</div>
			</div>
		</Modal>
	);
};

export default memo(AppleModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
