import React, { FC } from 'react';
import { send } from '@src/service/tcpServer';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/Modal';
import message from 'antd/lib/message';
import JigsawCheck from '../JigsawCheck';
import WordSelect from '../WordSelect';
import { Prop } from './componentType';
import { HumanVerify } from '@src/schema/socket/HumanVerify';

/**
 * 图形验证码弹框
 * @param props
 * @returns
 */
const HumanVerifyModal: FC<Prop> = (props) => {
	
	const { visible, usb, appId, title, humanVerifyData, closeHandle, dispatch } = props;

	/**
	 * 拼图handle
	 * @param value 值
	 */
	const onPiece = (value: number) => {
		console.log({
			usb,
			appId,
			value
		});
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.HumanReply,
			msg: {
				usb,
				appId,
				value
			}
		});
		message.info('验证结果已发送...');
		dispatch({
			type: 'cloudCodeModal/setHumanVerifyData',
			payload: {
				usb,
				m_strID: appId,
				humanVerifyData: null
			}
		});
		setTimeout(() => {
			closeHandle();
		}, 500);
	};
	/**
	 * 选字handle
	 * @param values 坐标值
	 */
	const onValid = (
		values: {
			x: number;
			y: number;
		}[]
	) => {
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.HumanReply,
			msg: {
				usb,
				appId,
				value: values
			}
		});
		message.info('验证结果已发送...');
		setTimeout(() => {
			closeHandle();
		}, 500);
	};

	const renderByType = (verifyData: HumanVerify | null) => {
		if (verifyData === null) {
			return null;
		} else {
			switch (verifyData.type) {
				case 'ARTIFICIAL_BLOCK_PUZZLE':
					return (
						<JigsawCheck
							bgSrc={verifyData.back_img.base64}
							gapSrc={verifyData.jigsaw_img.base64}
							bgWidth={verifyData.back_img.width}
							bgHeight={verifyData.back_img.height}
							gapWidth={verifyData.jigsaw_img.width}
							gapHeight={verifyData.jigsaw_img.height}
							gapInitStyle={verifyData.jigsaw_img.style}
							onPiece={onPiece}
						/>
					);
				case 'ARTIFICIAL_CLICK_WORD':
					return (
						<WordSelect
							src={verifyData.back_img.base64}
							width={verifyData.back_img.width}
							height={verifyData.back_img.height}
							size={3}
							onValid={onValid}>
							{verifyData.tips.check}
						</WordSelect>
					);
				default:
					return null;
			}
		}
	};

	return (
		<Modal
			visible={visible}
			width={humanVerifyData?.back_img.width! + 48}
			footer={[
				<Button onClick={() => closeHandle()} type="default" icon="close-circle">
					取消
				</Button>
			]}
			title={title}
			centered={true}
			maskClosable={false}
			closable={false}>
			{renderByType(humanVerifyData)}
		</Modal>
	);
};

export default HumanVerifyModal;
