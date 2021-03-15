import React, { FC, MouseEvent, useRef } from 'react';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import msgBox from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { helper } from '@utils/helper';
import { send } from '@src/service/tcpServer';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import {
	CaptchaMsg,
	CloudModalPressAction,
	CodeItemProps,
	SmsMessageType
} from './CloudCodeModalType';
import cloudApp from '@src/config/cloud-app.yaml';
import './CodeItem.less';

/**
 * 应用验证码输入（一条应用）
 * @param props
 */
const CodeItem: FC<CodeItemProps> = (props) => {
	const { usb, app, dispatch } = props;
	const inputRef = useRef<Input | null>(null);

	/**
	 * 重新发送验证码Click
	 */
	const resendClick = debounce(
		(e: MouseEvent<HTMLButtonElement>) => {
			if (inputRef.current) {
				send(SocketType.Fetch, {
					type: SocketType.Fetch,
					cmd: CommandType.SmsSend,
					msg: {
						usb,
						type: CloudModalPressAction.ResendCode,
						code: '',
						appId: app.m_strID,
						key: app.key
					}
				});
				//禁用
				dispatch({
					type: 'cloudCodeModal/setDisabled',
					payload: {
						usb,
						m_strID: app.m_strID,
						disabled: true
					}
				});
			}
		},
		500,
		{ leading: true, trailing: false }
	);

	/**
	 * 取消Click
	 */
	const cancelClick = (e: MouseEvent<HTMLButtonElement>) => {
		Modal.confirm({
			onOk() {
				if (inputRef.current) {
					send(SocketType.Fetch, {
						type: SocketType.Fetch,
						cmd: CommandType.SmsSend,
						msg: {
							usb,
							type: CloudModalPressAction.Cancel,
							code: '',
							appId: app.m_strID,
							key: app.key
						}
					});
					//禁用
					dispatch({
						type: 'cloudCodeModal/setDisabled',
						payload: {
							usb,
							m_strID: app.m_strID,
							disabled: true
						}
					});
				}
			},
			title: '取消云取证',
			content: `确认取消「${helper.getAppDesc(cloudApp, app.m_strID)}」？`,
			okText: '是',
			cancelText: '否',
			centered: true
		});
	};

	/**
	 * 发送Click
	 */
	const sendClick = debounce(
		(e: MouseEvent<HTMLButtonElement>) => {
			const { value } = inputRef.current?.input!;
			if (value) {
				send(SocketType.Fetch, {
					type: SocketType.Fetch,
					cmd: CommandType.SmsSend,
					msg: {
						usb,
						type: CloudModalPressAction.Send,
						code: value,
						appId: app.m_strID,
						key: app.key
					}
				});
				msgBox.success('验证码已发送');
				inputRef.current?.setValue('');
				//禁用
				dispatch({
					type: 'cloudCodeModal/setDisabled',
					payload: {
						usb,
						m_strID: app.m_strID,
						disabled: true
					}
				});
			} else {
				msgBox.destroy();
				msgBox.warn('请填写验证码');
				inputRef.current?.focus();
			}
		},
		500,
		{ leading: true, trailing: false }
	);

	/**
	 * 返回最后（最新）一条消息
	 * @param message 消息列表
	 */
	const getLast = (message: CaptchaMsg[]) => {
		if (message && message.length > 0) {
			const { content, type } = message[message.length - 1];
			switch (type) {
				case SmsMessageType.Normal:
					return <strong style={{ color: '#222' }}>{content}</strong>;
				case SmsMessageType.Warning:
					return <strong style={{ color: '#dc143c' }}>{content}</strong>;
				case SmsMessageType.Important:
					return <strong style={{ color: '#416eb5' }}>{content}</strong>;
				default:
					return <strong style={{ color: '#222' }}>{content}</strong>;
			}
		} else {
			return <strong></strong>;
		}
	};

	return (
		<div className="capp-row">
			<div className="fn-msg-panel">
				<label className="capp-name">{helper.getAppDesc(cloudApp, app.m_strID)}</label>
				<>{getLast(app.message)}</>
			</div>
			<div className="fn-input-panel">
				<label>验证码</label>
				<Input
					disabled={app.disabled}
					ref={inputRef}
					style={{ width: 130 }}
					placeholder="请输入短信验证码"
					size="small"
					maxLength={20}
				/>
				<Button onClick={sendClick} disabled={app.disabled} type="primary" size="small">
					确定
				</Button>
				<Button onClick={resendClick} disabled={app.disabled} type="default" size="small">
					重新发送验证码
				</Button>
				<Button onClick={cancelClick} disabled={app.disabled} type="default" size="small">
					取消
				</Button>
			</div>
		</div>
	);
};

export default CodeItem;
