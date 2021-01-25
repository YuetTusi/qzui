import React, { FC, memo } from 'react';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { Prop } from './componentType';
import { getImages } from './getImages';
import { helper } from '@src/utils/helper';
import FooterButtons from './FooterButtons';
import './GuideModal.less';

const { max } = helper.readConf();

/**
 * 提示消息引导图示框
 * @param props
 */
const GuideModal: FC<Prop> = (props) => {
	const { device } = props;

	/**
	 * 渲染内容区
	 */
	const renderContent = (): JSX.Element | string => {
		if (helper.isNullOrUndefinedOrEmptyString(device.tipContent)) {
			//图示消息
			let imgPath = getImages(device.tipImage!);
			if (imgPath === null) {
				return (
					<div className="flow">
						<Empty description="暂无图示" />
					</div>
				);
			} else {
				return (
					<div className="flow">
						<img src={imgPath} />
					</div>
				);
			}
		} else {
			//文本消息
			return <div className="text">{device.tipContent}</div>;
		}
	};

	/**
	 * 获取宽度
	 */
	const getWidth = () => {
		if (helper.isNullOrUndefinedOrEmptyString(device.tipContent)) {
			return max <= 2 ? 1020 : 1220;
		} else {
			return 400;
		}
	};

	return (
		<Modal
			visible={props.visible}
			title={device.tipTitle}
			onCancel={props.cancelHandle}
			footer={
				<FooterButtons {...props} yesHandle={props.yesHandle} noHandle={props.noHandle} />
			}
			width={getWidth()}
			centered={true}
			destroyOnClose={true}
			maskClosable={false}
			closable={true}
			className="guide-modal-root">
			{renderContent()}
		</Modal>
	);
};

GuideModal.defaultProps = {
	visible: false,
	device: {},
	yesHandle: () => {},
	noHandle: () => {},
	cancelHandle: () => {}
};

export default memo(GuideModal, (prev: Prop, next: Prop) => !prev.visible && !next.visible);
