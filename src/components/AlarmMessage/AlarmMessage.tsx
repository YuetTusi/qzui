import React, { FC } from 'react';
import { connect } from 'dva';
import Icon from 'antd/lib/icon';
import { StoreComponent } from '@src/type/model';
import { DashboardStore } from '@src/model/dashboard';
import './AlarmMessage.less';

interface Prop extends StoreComponent {
	/**
	 * 仓库State
	 */
	dashboard: DashboardStore;
}

/**
 *
 * @param props
 */
const AlarmMessage: FC<Prop> = (props) => {
	const { dispatch } = props;
	const { alertMessage } = props.dashboard;

	const closeHandle = () => {
		dispatch({ type: 'dashboard/setAlertMessage', payload: null });
	};

	return (
		<div
			style={{ display: alertMessage === null ? 'none' : 'block' }}
			className="alarm-message-root">
			<div className="alarm-message-bg">
				<Icon className="alarm-message-ico" type="sound" />
				<div className="alarm-message-txt">{alertMessage}</div>
				<div className="alarm-message-close-btn" title="关闭">
					<Icon type="close" onClick={closeHandle} />
				</div>
			</div>
		</div>
	);
};

export default connect((state: any) => ({ dashboard: state.dashboard }))(AlarmMessage);
