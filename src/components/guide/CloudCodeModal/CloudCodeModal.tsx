import React, { FC } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import withModeButton from '@src/components/enhance';
import CodeItem from './CodeItem';
import { Prop } from './CloudCodeModalType';
import './CloudCodeModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 云取证验证证码/密码输入框
 * @param props
 */
const CloudCodeModal: FC<Prop> = (props) => {
	const { dispatch, cloudCodeModal } = props;

	const renderItem = () => {
		const { devices, usb } = props.cloudCodeModal;
		const current = devices[usb - 1];

		if (current?.apps && current.apps.length > 0) {
			return current.apps.map((app, i) => (
				<CodeItem
					m_strID={app.m_strID}
					m_strPktlist={app.m_strPktlist}
					message={app.message}
					disabled={app.disabled}
					usb={usb}
					dispatch={dispatch!}
					key={`K_${i}`}
				/>
			));
		} else {
			return <Empty description="暂无云取应用" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
		}
	};

	return (
		<Modal
			footer={[
				// <Button
				// 	type="primary"
				// 	onClick={() => {
				// 		let cmd: any = {
				// 			type: SocketType.Fetch,
				// 			cmd: CommandType.SmsMsg,
				// 			msg: {
				// 				usb: 2,
				// 				appId: '1330001',
				// 				message: {
				// 					content: `#2_${Math.random().toString()}`,
				// 					type: SmsMessageType.Normal,
				// 					actionTime: new Date()
				// 				}
				// 			}
				// 		};
				// 		smsMsg(cmd, dispatch!);
				// 	}}>
				// 	2-测试
				// </Button>,
				// <Button
				// 	type="primary"
				// 	onClick={() => {
				// 		let cmd: any = {
				// 			type: SocketType.Fetch,
				// 			cmd: CommandType.SmsMsg,
				// 			msg: {
				// 				usb: 3,
				// 				appId: '1520001',
				// 				message: {
				// 					content: `#3_${Math.random().toString()}`,
				// 					type: SmsMessageType.Warning,
				// 					actionTime: new Date()
				// 				}
				// 			}
				// 		};
				// 		smsMsg(cmd, dispatch!);
				// 	}}>
				// 	3-测试
				// </Button>,
				<ModeButton
					onClick={() => {
						// dispatch!({ type: 'cloudCodeModal/setApps', payload: [] });
						props.cancelHandle();
					}}
					icon="close-circle">
					取消
				</ModeButton>
			]}
			visible={cloudCodeModal.visible}
			onCancel={props.cancelHandle}
			width={800}
			title="云取进度"
			destroyOnClose={true}
			maskClosable={false}
			className="cloud-code-model-root">
			<div className="scroll-item">{renderItem()}</div>
		</Modal>
	);
};

CloudCodeModal.defaultProps = {
	cancelHandle: () => {}
};

export default connect((state: any) => ({ cloudCodeModal: state.cloudCodeModal }))(CloudCodeModal);
