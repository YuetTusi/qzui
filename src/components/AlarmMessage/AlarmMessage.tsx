import React, { FC } from 'react';
import { connect } from 'dva';
import Icon from 'antd/lib/icon';
import { Prop } from './componentType';
import './AlarmMessage.less';

/**
 *
 * @param props
 */
const AlarmMessage: FC<Prop> = (props) => {
	const { dispatch } = props;
	const { alertMessage } = props.dashboard;

	const closeHandle = (id: string) => {
		dispatch({ type: 'dashboard/removeAlertMessage', payload: id });
	};

	const renderList = (): JSX.Element[] | null => {
		if (alertMessage.length === 0) {
			return null;
		} else {
			return alertMessage.map((item, index) => (
				<li key={`M_${index}`}>
					<div title={item.msg}>
						<Icon className="alarm-message-ico" type="sound" />
						<span className="alarm-message-txt">{item.msg}</span>
					</div>
					<div className="alarm-message-close-btn" title="关闭">
						<Icon type="close" onClick={() => closeHandle(item.id)} />
					</div>
				</li>
			));
		}
	};

	return (
		<div
			style={{ display: alertMessage.length === 0 ? 'none' : 'block' }}
			className="alarm-message-root">
			<div className="alarm-message-bg">
				<ul>{renderList()}</ul>
			</div>
		</div>
	);
};

export default connect((state: any) => ({ dashboard: state.dashboard }))(AlarmMessage);
