import React, { FC } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Progress from 'antd/lib/progress';
import { helper } from '@utils/helper';
import { StateTree } from '@src/type/model';
import { DeviceType } from '@src/schema/socket/DeviceType';
import ParseDetail from '@src/schema/socket/ParseDetail';
import { withModeButton } from '@src/components/enhance';
import { Prop } from './ProgressModalTypes';
import './ProgressModal.less';

const ModeButton = withModeButton()(Button);

const renderProgress = (device: DeviceType, parseDetails: ParseDetail[]) => {
	if (helper.isNullOrUndefined(device) || helper.isNullOrUndefined(parseDetails)) {
		return undefined;
	}
	return parseDetails.find((item) => item?.deviceId === device.id);
};

/**
 * 解析进度
 */
const ProgressModal: FC<Prop> = ({ device, progressModal, visible, cancelHandle }) => {
	const renderLine = (label: string, value?: string) => {
		if (helper.isNullOrUndefined(value)) {
			return null;
		} else {
			return (
				<div className="line">
					<label>{label}</label>
					<span>{label === '手机名称' ? value!.split('_')[0] : value}</span>
				</div>
			);
		}
	};

	/**
	 * 渲染详情（文本&进度值）
	 */
	// const renderProgress = () => {
	// 	if (
	// 		helper.isNullOrUndefined(props.device) ||
	// 		helper.isNullOrUndefined(props.progressModal.info)
	// 	) {
	// 		return undefined;
	// 	}
	// 	return props.progressModal.info.find((item) => {
	// 		return item?.deviceId === props?.device?.id;
	// 	});
	// };

	const detail = renderProgress(device, progressModal.info);

	return (
		<Modal
			visible={visible}
			footer={[
				<ModeButton onClick={() => cancelHandle()} type="default" icon="close-circle">
					取消
				</ModeButton>
			]}
			onCancel={() => cancelHandle()}
			maskClosable={false}
			title="解析详情"
			className="progress-modal-root">
			<div>
				<div className="info-block">
					<div className="title">
						<Icon type="mobile" />
						<span>手机信息</span>
					</div>
					<div className="content">
						<div className="ver">
							{renderLine('手机名称', device?.mobileName)}
							{renderLine('手机持有人', device?.mobileHolder)}
							{renderLine('手机编号', device?.mobileNo)}
							{renderLine('备注', device?.note)}
						</div>
					</div>
				</div>
				<div className="info-block">
					<div className="title">
						<Icon type="file-sync" />
						<span>解析详情</span>
					</div>
					<div className="content">
						<div className="hor">
							<div className="txt">{detail?.curinfo ?? ''}</div>
						</div>
						<div className="p-bar">
							<Progress
								percent={detail?.curprogress ?? 0}
								showInfo={false}
								strokeColor="#416eb5"
								size="small"
								status={(detail?.curprogress ?? 0) >= 100 ? 'normal' : 'active'}
								strokeLinecap="square"
							/>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

ProgressModal.defaultProps = {
	visible: false,
	cancelHandle: () => {}
};

export default connect((state: StateTree) => ({ progressModal: state.progressModal }))(
	ProgressModal
);
