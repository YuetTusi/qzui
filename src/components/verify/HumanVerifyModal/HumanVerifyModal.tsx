import React, { FC } from 'react';
import { connect } from 'dva';
import { StateTree } from '@src/type/model';
import { send } from '@src/service/tcpServer';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/Modal';
import message from 'antd/lib/message';
import { VerifyDataParam } from '@src/model/components/Verify';
import JigsawCheck from '../JigsawCheck';
import WordSelect from '../WordSelect';
import { Prop } from './componentType';

/**
 * 图形验证码弹框
 * @param props
 * @returns
 */
const HumanVerifyModal: FC<Prop> = (props) => {
	const { dispatch, humanVerify } = props;

	/**
	 * 拼图handle
	 * @param value 值
	 */
	const onPiece = (value: number) => {
		console.log(value);
		const { usb } = humanVerify;
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.HumanReply,
			msg: {
				usb,
				value
			}
		});
		message.info('验证结果已发送...');
		setTimeout(() => {
			dispatch({ type: 'humanVerify/clearVerifyData' });
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
		console.log(values);
		const { usb } = humanVerify;
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.HumanReply,
			msg: {
				usb,
				value: values
			}
		});
		message.info('验证结果已发送...');
		setTimeout(() => {
			dispatch({ type: 'humanVerify/clearVerifyData' });
		}, 500);
	};

	const getTitle = (verifyData: VerifyDataParam | null) => {
		if (verifyData === null) {
			return '图形验证';
		} else {
			switch (verifyData.type) {
				case 'ARTIFICIAL_BLOCK_PUZZLE':
					return '请向右滑动完成拼图';
				case 'ARTIFICIAL_CLICK_WORD':
					return '请按要求依次点选文字';
				default:
					return '图形验证';
			}
		}
	};

	const renderByType = (verifyData: VerifyDataParam | null) => {
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
			visible={humanVerify.verifyData !== null}
			width={humanVerify.verifyData?.back_img.width! + 48}
			footer={[
				<Button
					onClick={() => dispatch({ type: 'humanVerify/clearVerifyData' })}
					type="default"
					icon="close-circle">
					取消
				</Button>
			]}
			title={getTitle(humanVerify.verifyData)}
			maskClosable={false}
			closable={false}>
			{renderByType(humanVerify.verifyData)}
		</Modal>
	);
};

export default connect((state: StateTree) => ({ humanVerify: state.humanVerify }))(
	HumanVerifyModal
);
