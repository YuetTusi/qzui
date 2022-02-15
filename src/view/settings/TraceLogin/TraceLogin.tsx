import debounce from 'lodash/debounce';
import React, { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Alert from 'antd/lib/alert';
import Button from 'antd/lib/button';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Statistic from 'antd/lib/statistic';
import { helper } from '@utils/helper';
import { useMount } from '@src/hooks';
import Title from '@src/components/title';
import { TraceUser } from '@src/schema/TraceUser';
import { SocketType, CommandType } from '@src/schema/socket/Command';
import { send } from '@src/service/tcpServer';
import { StateTree } from '@src/type/model';
import { LoginState } from '@src/model/settings/TraceLogin';
import LoginForm from './LoginForm';
import { TraceLoginProp } from './TraceLoginProp';
import './TraceLogin.less';

// import { traceLogin as traceLoginMethod } from '@src/model/dashboard/Device/listener';

const { Trace } = SocketType;

const getLoginState = (state: LoginState) => {
	switch (state) {
		case LoginState.NotLogin:
			return 'info';
		case LoginState.IsLogin:
			return 'success';
		case LoginState.LoginError:
			return 'error';
		default:
			return 'info';
	}
};

/**
 * 查询登录
 */
const TraceLogin: FC<TraceLoginProp> = ({ dispatch, traceLogin }) => {
	const { limitCount, loginState, loginMessage } = traceLogin;
	const loginFormRef = useRef<any>(null); //表单ref
	const [remember, setRemember] = useState<boolean>(false);

	useMount(() => dispatch({ type: 'traceLogin/queryUser', payload: null }));

	useEffect(() => {
		const { username, password, remember } = traceLogin;
		const { setFieldsValue } = loginFormRef.current;

		if (username !== undefined && password !== undefined) {
			setFieldsValue({
				username,
				password: helper.base64ToString(password)
			});
			setRemember(remember);
		}
	}, [traceLogin]);

	/**
	 * 保存状态Change
	 */
	function onRememberChange(event: CheckboxChangeEvent) {
		setRemember(event.target.checked);
		dispatch({ type: 'traceLogin/updateRemember', payload: event.target.checked });
	}

	/**
	 * 登录Submit
	 */
	const onLoginSubmit = debounce(
		(event: MouseEvent<HTMLButtonElement>) => {
			event.preventDefault();
			const { validateFields } = loginFormRef.current;
			validateFields((error: any, { username, password }: TraceUser) => {
				if (error) {
					console.warn(error);
				} else {
					dispatch({ type: 'traceLogin/setLoginState', payload: LoginState.Busy });
					//用户&密码存库
					dispatch({
						type: 'traceLogin/saveUser',
						payload: {
							username,
							password: helper.stringToBase64(password),
							remember
						}
					});
					dispatch({
						type: 'traceLogin/setUser',
						payload: { username, password: helper.stringToBase64(password), remember }
					});
					send(Trace, {
						type: Trace,
						cmd: CommandType.TraceLogin,
						msg: { username, password }
					});
				}
			});
		},
		500,
		{ leading: true, trailing: false }
	);

	return (
		<div className="trace-login-root">
			<Title>查询登录</Title>
			<div className="edge-box">
				<div className="sort-root">
					<div className="sort">
						<div className="remain-box">
							<Alert
								message={loginMessage}
								type={getLoginState(loginState)}
								showIcon={true}
							/>
							<Statistic title="剩余次数" value={limitCount} />
						</div>

						<hr />
						<div className="trace-panel">
							<LoginForm loginState={loginState} ref={loginFormRef} />
						</div>
						<Row>
							<Col span={24}>
								<div className="remember-box">
									<Button
										onClick={onLoginSubmit}
										disabled={
											loginState === LoginState.Busy ||
											loginState === LoginState.IsLogin
										}
										type="primary"
										icon={loginState === LoginState.Busy ? 'loading' : 'user'}>
										登录
									</Button>
									<Checkbox checked={remember} onChange={onRememberChange}>
										<span>保持登录状态</span>
									</Checkbox>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</div>
		</div>
	);
};

export default connect((state: StateTree) => ({ traceLogin: state.traceLogin }))(TraceLogin);
