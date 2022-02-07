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
import Title from '@src/components/title/Title';
import { TraceUser } from '@src/schema/TraceUser';
import { SocketType, CommandType } from '@src/schema/socket/Command';
import { send } from '@src/service/tcpServer';
import { StateTree } from '@src/type/model';
import { LoginState } from '@src/model/settings/TraceLogin';
import LoginForm from './LoginForm';
import { TraceLoginProp } from './TraceLoginProp';
import './TraceLogin.less';

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

const getLoginMessage = (state: LoginState, username?: string) => {
	switch (state) {
		case LoginState.NotLogin:
			return '尚未登录';
		case LoginState.IsLogin:
			return `${username ?? ''} 已登录`;
		case LoginState.LoginError:
			return '登录失败';
		default:
			return '暂未登录';
	}
};

/**
 * 查询登录
 */
const TraceLogin: FC<TraceLoginProp> = ({ dispatch, traceLogin }) => {
	const { limitCount, loginState, username } = traceLogin;
	const loginFormRef = useRef<any>(null); //表单ref
	const [remember, setRemember] = useState<boolean>(false);

	useEffect(() => {
		const { resetFields } = loginFormRef.current;
		if (loginState === LoginState.IsLogin) {
			resetFields();
		}
	}, [loginState]);

	/**
	 * 保存状态Change
	 */
	const onRememberChange = (event: CheckboxChangeEvent) => setRemember(event.target.checked);

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
					if (remember) {
						//用户勾选记住，用户密&密码存库
						dispatch({
							type: 'traceLogin/saveUser',
							payload: {
								username,
								password: helper.stringToBase64(password)
							}
						});
					} else {
						//否则从库中清空用户
						dispatch({ type: 'traceLogin/delUser' });
					}
					dispatch({ type: 'traceLogin/setLoginState', payload: LoginState.IsLogin });
					dispatch({ type: 'traceLogin/setUser', payload: { username, password } });
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
								message={getLoginMessage(loginState, username)}
								type={getLoginState(loginState)}
								showIcon={true}
							/>
							<Statistic title="剩余次数" value={limitCount} />
						</div>

						<hr />
						<div className="trace-panel">
							<LoginForm ref={loginFormRef} />
						</div>
						<Row>
							<Col span={24}>
								<div className="remember-box">
									<Button onClick={onLoginSubmit} type="primary" icon="key">
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
