import React, { FC, MouseEvent, useRef } from 'react';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import msgBox from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { helper } from '@utils/helper';
import { send } from '@src/service/tcpServer';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { CaptchaMsg, CloudModalPressAction, CodeItemProps } from './CloudCodeModalType';
import cloudApp from '@src/config/cloud-app.yaml';
import './CodeItem.less';

/**
 * 应用验证码输入（一条应用）
 * @param props
 */
const CodeItem: FC<CodeItemProps> = (props) => {
	const { usb, m_strID, m_strPktlist, disabled, message, dispatch } = props;
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
						appId: m_strID,
						packages: m_strPktlist
					}
				});
			}
		},
		500,
		{ leading: true, trailing: false }
	);

	const getLast = (message: CaptchaMsg[]) => {
		if (message && message.length > 0) {
			return message[message.length - 1].content;
		} else {
			return '';
		}
	};

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
							appId: m_strID,
							packages: m_strPktlist
						}
					});
					//取消后禁用
					dispatch({
						type: 'cloudCodeModal/setDisabled',
						payload: {
							usb,
							m_strID,
							disabled: true
						}
					});
				}
			},
			title: '取消云取证',
			content: `确认取消「${helper.getAppDesc(cloudApp, m_strID)}」？`,
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
						appId: m_strID,
						packages: m_strPktlist
					}
				});
				msgBox.success('验证码已发送');
				inputRef.current?.setValue('');
			} else {
				msgBox.destroy();
				msgBox.warn('请填写验证码');
				inputRef.current?.focus();
			}
		},
		500,
		{ leading: true, trailing: false }
	);

	return (
		<div className="capp-row">
			<div className="fn-msg-panel">
				<label className="capp-name">{helper.getAppDesc(cloudApp, m_strID)}</label>
				<strong>{getLast(message)}</strong>
			</div>
			<div className="fn-input-panel">
				<label>验证码</label>
				<Input
					disabled={disabled}
					ref={inputRef}
					style={{ width: 130 }}
					placeholder="请输入短信验证码"
					size="small"
					maxLength={20}
				/>
				<Button onClick={sendClick} disabled={disabled} type="primary" size="small">
					确定
				</Button>
				<Button onClick={resendClick} disabled={disabled} type="default" size="small">
					重新发送验证码
				</Button>
				<Button onClick={cancelClick} disabled={disabled} type="default" size="small">
					取消
				</Button>
			</div>
		</div>
	);
};

export default CodeItem;
