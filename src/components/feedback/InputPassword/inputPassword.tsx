import React from 'react';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import PasswordInput from './PasswordInput';
import { DeviceParam, OkHandle } from './componentTypes';
import './DevicePassword.less';

/**
 * 提示用户确认密码
 * 以notification呈献，全局消息
 */
const inputPassword = (params: DeviceParam, callback: OkHandle) => {
	const [name] = params.mobileName.split('_');
	notification.info({
		key: `pwd-confirm-${params.deviceId}`,
		message: '密码确认',
		description: `导入「${name}」数据请输入备份密码：`,
		duration: null,
		icon: <Icon type="lock" style={{ color: '#416eb5' }} />,
		className: 'device-password-root',
		// closeIcon: <span></span>,
		btn: (
			<PasswordInput
				params={params}
				okHandle={callback}
				notificationId={`pwd-confirm-${params.deviceId}`}
			/>
		),
		onClose: () => callback(params, true)
	});
};

export { inputPassword };
