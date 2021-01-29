import React, { FC, useRef } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import notification from 'antd/lib/notification';
import { DeviceParam, OkHandle } from './componentTypes';

interface Prop {
	/**
	 * 通告组件id
	 */
	notificationId: string;
	/**
	 * 后台传回的参数（导入的手机）
	 */
	params: DeviceParam;
	/**
	 * 确认handle
	 */
	okHandle: OkHandle;
}

/**
 * 密码输入组件
 */
const PasswordInput: FC<Prop> = (props) => {
	const inputRef = useRef<any>();

	return (
		<div className="password-panel">
			<Input ref={inputRef} size="small" placeholder="请输入备份密码" />
			<Button
				type="primary"
				size="small"
				onClick={() => {
					props.okHandle(props.params, false, inputRef.current.input.value);
					notification.close(props.notificationId);
				}}>
				<Icon type="check-circle" />
			</Button>
		</div>
	);
};

export default PasswordInput;
