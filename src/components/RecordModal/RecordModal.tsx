import React, { FC, memo } from 'react';
import moment from 'moment';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { Prop } from './recordComponentType';
import { helper } from '@src/utils/helper';
import { withModeButton } from '@src/components/enhance';
import { ProgressType } from '@src/schema/socket/FetchRecord';
import './RecordModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 采集记录框
 */
const RecordModal: FC<Prop> = ({ title, visible, data, cancelHandle }) => {
	/**
	 * 渲染时间
	 * @param time 时间对象
	 */
	const renderTime = (time: Date) => {
		if (helper.isNullOrUndefined(time)) {
			return '- - -';
		} else {
			return moment(time).format('YYYY-MM-DD HH:mm:ss');
		}
	};

	/**
	 * 渲染记录数据
	 */
	const renderData = () => {
		if (helper.isNullOrUndefined(data) || data?.length === 0) {
			return (
				<div className="middle">
					<Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
			);
		} else {
			return (
				<ul>
					{data?.map((item, index) => {
						switch (item.type) {
							case ProgressType.Normal:
								return (
									<li key={`R_${index}`}>
										<label>【{renderTime(item.time)}】</label>
										<span style={{ color: '#222' }}>{item.info}</span>
									</li>
								);
							case ProgressType.Warning:
								return (
									<li key={`R_${index}`}>
										<label>【{renderTime(item.time)}】</label>
										<span style={{ color: '#dc143c' }}>{item.info}</span>
									</li>
								);
							case ProgressType.Message:
								return (
									<li key={`R_${index}`}>
										<label>【{renderTime(item.time)}】</label>
										<span style={{ color: '#416eb5' }}>{item.info}</span>
									</li>
								);
							default:
								return (
									<li key={`R_${index}`}>
										<label>【{renderTime(item.time)}】</label>
										<span style={{ color: '#222' }}>{item.info}</span>
									</li>
								);
						}
					})}
				</ul>
			);
		}
	};

	return (
		<Modal
			visible={visible}
			footer={[
				<ModeButton type="default" icon="close-circle" onClick={cancelHandle}>
					取消
				</ModeButton>
			]}
			onCancel={cancelHandle}
			title={title}
			width={800}
			maskClosable={false}
			destroyOnClose={true}
			className="record-modal-root">
			<div className="list-block">{renderData()}</div>
		</Modal>
	);
};

RecordModal.defaultProps = {
	visible: false,
	data: [],
	title: '采集记录',
	cancelHandle: () => {}
};

export default memo(RecordModal, (prev: Prop, next: Prop) => {
	return !prev.visible && !next.visible;
});
