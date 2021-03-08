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
	const { usb, mobileHolder = '云取进度', mobileNumber = '...' } = cloudCodeModal;
	const currentDevice = cloudCodeModal.devices[usb - 1];

	const renderItem = () => {
		if (currentDevice?.apps && currentDevice.apps.length > 0) {
			return currentDevice.apps.map((app, i) => (
				<CodeItem app={app} usb={usb} dispatch={dispatch!} key={`K_${i}`} />
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
				// 				appId: '1030063',
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
				// 				usb: 2,
				// 				appId: '68a9a29e',
				// 				message: {
				// 					content: `#2_${Math.random().toString()}`,
				// 					type: SmsMessageType.Warning,
				// 					actionTime: new Date()
				// 				}
				// 			}
				// 		};
				// 		smsMsg(cmd, dispatch!);
				// 	}}>
				// 	3-测试
				// </Button>,
				<ModeButton onClick={props.cancelHandle} icon="close-circle">
					取消
				</ModeButton>
			]}
			visible={cloudCodeModal.visible}
			onCancel={props.cancelHandle}
			width={800}
			title={`${mobileHolder}（${mobileNumber}）`}
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
