import React from 'react';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import Db from '@utils/db';
import { TableName } from '@src/schema/db/TableName';
import DeviceType from '@src/schema/socket/DeviceType';
import PasswordInput from './PasswordInput';
import { DeviceParam, OkHandle } from './componentTypes';
import './DevicePassword.less';

/**
 * 提示用户确认密码
 * 以notification呈献，全局消息
 */
const inputPassword = (params: DeviceParam, callback: OkHandle) => {
	const db = new Db<DeviceType>(TableName.Device);

	db.findOne({ id: params.deviceId })
		.then((data: DeviceType) => {
			notification.info({
				key: `pwd-confirm-${params.deviceId}`,
				message: '密码确认',
				description: `导入「${data.mobileName!.split('_')[0]}」数据请输入备份密码：`,
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
				onClose: () => callback(params, true, '')
			});
		})
		.catch((err) =>
			notification.info({
				key: `pwd-confirm-${params.deviceId}`,
				message: '密码确认',
				description: `导入数据请输入备份密码：`,
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
				onClose: () => callback(params, true, '')
			})
		);
};

export { inputPassword };
