import React, { FC, memo, MouseEvent, useRef } from 'react';
import debounce from 'lodash/debounce';
import msgBox from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { send } from '@src/service/tcpServer';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { CloudModalPressAction, CodeItemProps } from './CloudCodeModalType';
import cloudApp from '@src/config/cloud-app.yaml';
import './CodeItem.less';

const getDesc = (id: string) =>
	cloudApp.fetch
		.map((i: any) => i.app_list)
		.flat()
		.find((i: any) => i.app_id === id).desc;

/**
 * 应用验证码输入（一条应用）
 * @param props
 */
const CodeItem: FC<CodeItemProps> = (props) => {
	const { usb, m_strID, m_strPktlist, message } = props;
	const inputRef = useRef<HTMLInputElement | null>(null);

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
				console.log('usb:', usb);
				console.log('type:', CloudModalPressAction.ResendCode);
				console.log('appId:', m_strID);
				console.log('packages:', m_strPktlist);
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
							appId: m_strID,
							packages: m_strPktlist
						}
					});
					console.log('usb:', usb);
					console.log('type:', CloudModalPressAction.Cancel);
					console.log('appId:', m_strID);
					console.log('packages:', m_strPktlist);
				}
			},
			title: '取消云取证',
			content: `确认取消「${getDesc(m_strID)}」？`,
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
			const { value } = inputRef.current!;
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
				inputRef.current!.value = '';
				console.log('usb:', usb);
				console.log('type:', CloudModalPressAction.Send);
				console.log('code:', value);
				console.log('appId:', m_strID);
				console.log('packages:', m_strPktlist);
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
		<div className="code-item-root">
			<fieldset>
				<legend>{getDesc(m_strID)}</legend>
				<div className="fn-msg-panel">
					<label>消息</label>
					<span>{message}</span>
				</div>
				<div className="fn-input-panel">
					<label>验证码</label>
					<input
						ref={inputRef}
						placeholder="请输入短信验证码"
						className="fake-ant-input"
						type="text"
						maxLength={20}
					/>
					<button onClick={resendClick} className="fake-ant-button" type="button">
						重新发送验证码
					</button>
					<button onClick={cancelClick} className="fake-ant-button" type="button">
						取消
					</button>
					<button onClick={sendClick} className="fake-ant-button primary" type="button">
						确定
					</button>
				</div>
			</fieldset>
		</div>
	);
};

export default memo(CodeItem);
