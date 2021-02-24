import React, { FC } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';
import { helper } from '@utils/helper';
import { OneCloudApp } from '@src/model/components/CloudCodeModal';
import { CaptchaMsg, SmsMessageType } from '../guide/CloudCodeModal/CloudCodeModalType';
import cloudApp from '@src/config/cloud-app.yaml';
import { Prop } from './CloudHistoryModalProps';
import './CloudHistoryModal.less';

const { TabPane } = Tabs;

/**
 * 云取证采集记录框
 * @param props
 */
const CloudHistoryModal: FC<Prop> = (props) => {
	const { visible, device, cloudCodeModal } = props;

	const renderLi = (msg: CaptchaMsg[]) => {
		if (msg && msg.length > 0) {
			const next = msg.map((item, i) => {
				switch (item.type) {
					case SmsMessageType.Normal:
						return (
							<li key={`L_${i}`}>
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span style={{ color: '#222' }}>{item.content}</span>
							</li>
						);
					case SmsMessageType.Warning:
						return (
							<li key={`L_${i}`}>
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span style={{ color: '#dc143c' }}>{item.content}</span>
							</li>
						);
					case SmsMessageType.Important:
						return (
							<li key={`L_${i}`}>
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span style={{ color: '#416eb5' }}>{item.content}</span>
							</li>
						);
					default:
						return (
							<li key={`L_${i}`}>
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span>{item.content}</span>
							</li>
						);
				}
			});
			return (
				<div className="list-panel">
					<ul>{next}</ul>
				</div>
			);
		} else {
			return (
				<div className="list-panel empty">
					<Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
			);
		}
	};

	const renderPane = (apps: OneCloudApp[]) =>
		apps.map((app, i) => (
			<TabPane tab={helper.getAppDesc(cloudApp, app.m_strID)} key={`P_${i}`}>
				{renderLi(app.message)}
			</TabPane>
		));

	const renderTab = () => {
		const { devices } = cloudCodeModal;
		if (helper.isNullOrUndefined(devices[device.usb! - 1])) {
			return <Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
		}

		const { apps } = devices[device.usb! - 1];
		if (apps && apps.length > 0) {
			return (
				<Tabs tabPosition="left" size="small">
					{renderPane(apps)}
				</Tabs>
			);
		} else {
			return <Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
		}
	};

	return (
		<Modal
			footer={[
				<Button onClick={props.cancelHandle} icon="close-circle" type="default">
					取消
				</Button>
			]}
			onCancel={props.cancelHandle}
			visible={visible}
			className="cloud-history-modal-root"
			destroyOnClose={true}
			maskClosable={false}
			width={850}
			title="采集记录">
			{renderTab()}
		</Modal>
	);
};

CloudHistoryModal.defaultProps = {
	visible: false,
	cancelHandle: () => {}
};

//共用CloudCodeModal组件的Model
export default connect((state: any) => ({ cloudCodeModal: state.cloudCodeModal }))(
	CloudHistoryModal
);
