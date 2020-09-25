import React, { FC, memo } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { withModeButton } from '@src/components/enhance';
import oppoImg from './images/oppo.png';
import './OppoDevModal.less';

const ModeButton = withModeButton()(Button);

interface Prop {
	visible: boolean;
	okHandle?: () => void;
}

/**
 * OPPO打开开发者提示框
 * @param props
 */
const OppoDevModal: FC<Prop> = (props) => {
	return (
		<Modal
			title="打开OPPO开发者模式"
			visible={props.visible}
			footer={[
				<ModeButton
					type="primary"
					icon="check-circle"
					onClick={() => {
						if (props) {
							props.okHandle!();
						}
					}}>
					确定
				</ModeButton>
			]}
			centered={true}
			maskClosable={false}
			closable={false}
			width={960}>
			<div className="oppo-dev-modal-root">
				<div className="content">
					<img src={oppoImg} alt="iPhone信任" />
				</div>
			</div>
		</Modal>
	);
};

export default memo(OppoDevModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
