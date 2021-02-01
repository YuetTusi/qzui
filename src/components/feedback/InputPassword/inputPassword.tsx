import { remote } from 'electron';
import React from 'react';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import logger from '@utils/log';
import { DbInstance } from '@type/model';
import { TableName } from '@src/schema/db/TableName';
import DeviceType from '@src/schema/socket/DeviceType';
import PasswordInput from './PasswordInput';
import { DeviceParam, OkHandle } from './componentTypes';
import './DevicePassword.less';

const getDb = remote.getGlobal('getDb');

/**
 * 提示用户确认密码
 * 以notification呈献，全局消息
 */
const inputPassword = (params: DeviceParam, callback: OkHandle) => {
	const db: DbInstance<DeviceType> = getDb(TableName.Device);

	let desc: JSX.Element = <></>;

	db.findOne({ id: params.deviceId })
		.then((data: DeviceType) => {
			desc = (
				<>
					<div>导入「{data.mobileName!.split('_')[0]}」数据请输入备份密码：</div>
					<div>
						（<em>空密码为取消导入</em>）
					</div>
				</>
			);
		})
		.catch((err) => {
			logger.error(
				`未查询到第三方导入手机名称 @src/components/feedback/InputPassword: ${err.message}`
			);
			desc = (
				<>
					<div>导入数据请输入备份密码：</div>
					<div>
						（<em>输入空密码为取消导入</em>）
					</div>
				</>
			);
		})
		.then(() => {
			notification.info({
				key: `pwd-confirm-${params.deviceId}`,
				message: '密码确认',
				description: desc,
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
		});
};

export { inputPassword };
