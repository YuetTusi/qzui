import React, { forwardRef } from 'react';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import { LoginState } from '@src/model/settings/TraceLogin';
import { LoginFormProp } from './TraceLoginProp';

const { Password } = Input;
const { Item, create } = Form;

const LoginForm = create<LoginFormProp>({ name: 'traceLogin' })(
	forwardRef<Form, LoginFormProp>(({ form, loginState }, ref) => {
		const { getFieldDecorator } = form;

		return (
			<Form ref={ref} layout="vertical">
				<Row>
					<Col span={24}>
						<Item label="用户">
							{getFieldDecorator('username', {
								rules: [{ required: true, message: '请输入用户' }]
							})(
								<Input
									disabled={
										loginState === LoginState.Busy ||
										loginState === LoginState.IsLogin
									}
								/>
							)}
						</Item>
					</Col>
				</Row>
				<Row>
					<Col span={24}>
						<Item label="密码">
							{getFieldDecorator('password', {
								rules: [{ required: true, message: '请输入密码' }]
							})(
								<Password
									disabled={
										loginState === LoginState.Busy ||
										loginState === LoginState.IsLogin
									}
								/>
							)}
						</Item>
					</Col>
				</Row>
			</Form>
		);
	})
);

export default LoginForm;
