import React, { FC, useEffect } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import withModeButton from '@src/components/enhance';
import { AppCodeItem } from '@src/model/components/CloudCodeModal';
import { Prop } from './CloudCodeModalType';
import CodeItem from './CodeItem';
import './CloudCodeModal.less';
import { smsMsg } from '@src/model/dashboard/Device/listener';
import CommandType, { Command, SocketType } from '@src/schema/socket/Command';

const ModeButton = withModeButton()(Button);

/**
 * 云取证验证证码/密码输入框
 * @param props
 */
const CloudCodeModal: FC<Prop> = (props) => {
	const { dispatch, device, visible } = props;

	useEffect(() => {
		if (visible && device.cloudAppList && device.cloudAppList.length > 0) {
			let apps: AppCodeItem[] = device.cloudAppList.map((app) => ({
				m_strID: app.m_strID,
				m_strPktlist: app.m_strPktlist,
				message: ''
			}));
			dispatch!({ type: 'cloudCodeModal/setApps', payload: apps });
		}
	}, [visible]);

	const renderItem = () => {
		const { apps } = props.cloudCodeModal;
		if (apps.length > 0) {
			return apps.map((app, i) => <CodeItem {...app} usb={device.usb!} key={`K_${i}`} />);
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
				// 		let command: Command = {
				// 			type: SocketType.Fetch,
				// 			cmd: CommandType.SmsMsg,
				// 			msg: {
				// 				usb: 1,
				// 				appId: '1330001',
				// 				message: `msg_${Math.random().toString()}`
				// 			}
				// 		};
				// 		smsMsg(command, dispatch!);
				// 	}}>
				// 	测试
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
			visible={props.visible}
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
	visible: false,
	cancelHandle: () => {}
};

export default connect((state: any) => ({ cloudCodeModal: state.cloudCodeModal }))(CloudCodeModal);
