import React, { FC, memo, MouseEvent, useRef } from 'react';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
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
		<div className="capp-row">
			<div className="fn-msg-panel">
				<label className="capp-name">{getDesc(m_strID)}</label>
				<strong>{message}</strong>
			</div>
			<div className="fn-input-panel">
				<label>验证码</label>
				<Input ref={inputRef} placeholder="请输入短信验证码" size="small" maxLength={20} />
				<Button onClick={resendClick} type="default" size="small">
					重新发送验证码
				</Button>
				<Button onClick={cancelClick} type="default" size="small">
					取消
				</Button>
				<Button onClick={sendClick} type="primary" size="small">
					确定
				</Button>
			</div>
		</div>
	);
};

export default memo(CodeItem);
