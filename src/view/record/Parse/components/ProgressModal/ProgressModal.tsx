import React, { FC } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import { helper } from '@utils/helper';
import { withModeButton } from '@src/components/enhance';
import { Prop } from './ProgressModalTypes';
import './ProgressModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 解析进度
 * @param props
 */
const ProgressModal: FC<Prop> = (props) => {
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
	 * 渲染详情文本
	 */
	const renderInfo = () => {
		if (
			helper.isNullOrUndefined(props.device) ||
			helper.isNullOrUndefined(props.progressModal.info)
		) {
			return '';
		}
		let current = props.progressModal.info.find((item) => {
			return item?.deviceId === props?.device?.id;
		});
		if (current) {
			return current.curinfo;
		} else {
			return '';
		}
	};

	return (
		<Modal
			visible={props.visible}
			footer={[
				<ModeButton onClick={() => props.cancelHandle()} type="default" icon="close-circle">
					取消
				</ModeButton>
			]}
			onCancel={() => props.cancelHandle()}
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
							{renderLine('手机名称', props.device?.mobileName)}
							{renderLine('手机持有人', props.device?.mobileHolder)}
							{renderLine('手机编号', props.device?.mobileNo)}
							{renderLine('备注', props.device?.note)}
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
							<div className="txt">{renderInfo()}</div>
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

export default connect((state: StateTree) => ({ progressModal: state.progressModal }))(ProgressModal);
