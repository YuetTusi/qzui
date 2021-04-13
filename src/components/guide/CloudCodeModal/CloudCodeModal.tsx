import React, { FC, useState } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import withModeButton from '@src/components/enhance';
import HumanVerifyModal from '@src/components/verify/HumanVerifyModal';
import { HumanVerify } from '@src/schema/socket/HumanVerify';
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

	const [humanVerifyData, setHumanVerifyData] = useState<HumanVerify | null>(null);
	const [appId, setAppId] = useState('');
	const [appDesc, setAppDesc] = useState('');

	const renderItem = () => {
		if (currentDevice?.apps && currentDevice.apps.length > 0) {
			return currentDevice.apps.map((app, i) => (
				<CodeItem
					app={app}
					usb={usb}
					humanVerifyDataHandle={(data, appId, appDesc) => {
						setHumanVerifyData(data);
						setAppId(appId);
						setAppDesc(appDesc);
					}}
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
				// 				appId: '1030063',
				// 				disabled: true,
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
				// 				appId: '1030063',
				// 				message: {
				// 					content: `#2_${Math.random().toString()}`,
				// 					type: SmsMessageType.Warning,
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
				// 				appId: '1030063',
				// 				humanVerifyData: {
				// 					slider: {
				// 						width: 65,
				// 						height: 65
				// 					},
				// 					type: 'ARTIFICIAL_BLOCK_PUZZLE',
				// 					jigsaw_img: {
				// 						base64: chunkImage,
				// 						width: 64,
				// 						style: 'top: 46px; left: 0px; width: 64px; height: 64px;',
				// 						height: 64
				// 					},
				// 					back_img: {
				// 						base64: bgImage,
				// 						width: 300,
				// 						height: 180
				// 					}
				// 				}
				// 			}
				// 		};
				// 		humanVerify(cmd, dispatch!);
				// 		cmd.msg.appId = 'no_b92dd0ca';
				// 		humanVerify(cmd, dispatch!);
				// 	}}>
				// 	2-发送图形验证
				// </Button>,
				// <Button
				// 	type="primary"
				// 	onClick={() => {
				// 		let cmd: any = {
				// 			type: SocketType.Fetch,
				// 			cmd: CommandType.SmsMsg,
				// 			msg: {
				// 				usb: 2,
				// 				appId: '1030063',
				// 				humanVerifyData: null
				// 			}
				// 		};
				// 		humanVerify(cmd, dispatch!);
				// 	}}>
				// 	2-清空图形验证
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
			<>
				<div className="scroll-item">{renderItem()}</div>
				<HumanVerifyModal
					visible={humanVerifyData !== null}
					usb={usb}
					appId={appId}
					title={`${appDesc}-请滑动正确拼合图片`}
					humanVerifyData={humanVerifyData}
					closeHandle={() => {
						setHumanVerifyData(null);
					}}
					dispatch={dispatch!}
				/>
			</>
		</Modal>
	);
};

CloudCodeModal.defaultProps = {
	cancelHandle: () => {}
};

export default connect((state: StateTree) => ({ cloudCodeModal: state.cloudCodeModal }))(
	CloudCodeModal
);
