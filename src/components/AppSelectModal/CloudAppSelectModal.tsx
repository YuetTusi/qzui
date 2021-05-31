import React, { FC, useEffect } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import withModeButton from '../enhance';
import { CloudAppSelectModalProp } from './componentType';
import { toAppTreeData, addHoverDom, removeHoverDom } from './helper';
import './AppSelectModal.less';

const ModeButton = withModeButton()(Button);
let ztree: any = null;

/**
 * 云取App选择弹框
 * @param props
 */
const CloudAppSelectModal: FC<CloudAppSelectModalProp> = (props) => {
	const { selectedKeys, isMulti, dispatch } = props;

	/**
	 * 处理树组件数据
	 */
	useEffect(() => {
		let checkOption: Record<string, any> = {
			enable: true
		};
		if (!isMulti) {
			checkOption.chkStyle = 'radio';
			checkOption.radioType = 'all';
		}
		if (props.visible) {
			const { cloudAppData } = props.dashboard;
			if (cloudAppData.length === 0) {
				dispatch({ type: 'dashboard/fetchCloudAppData' });
			}
			let $treePlace = document.getElementById('treePlace');
			if ($treePlace) {
				$treePlace.remove();
			}
			ztree = ($.fn as any).zTree.init(
				$('#select-app-tree'),
				{
					check: checkOption,
					view: {
						showIcon: true,
						addHoverDom,
						removeHoverDom
					},
					callback: {
						beforeClick: () => false
					}
				},
				toAppTreeData(cloudAppData, selectedKeys, isMulti)
			);
		}
	}, [props.visible, props.dashboard.cloudAppData]);

	return (
		<Modal
			visible={props.visible}
			footer={[
				<ModeButton onClick={props.closeHandle} type="default" icon="close-circle">
					取消
				</ModeButton>,
				<ModeButton
					onClick={() => {
						props.okHandle(ztree.getCheckedNodes());
					}}
					type="primary"
					icon="check-circle">
					确定
				</ModeButton>
			]}
			onCancel={props.closeHandle}
			title={props.title ?? '选择App'}
			maskClosable={false}
			destroyOnClose={true}
			zIndex={1001}
			forceRender={true}
			style={{ top: 80 }}
			className="app-select-modal-root">
			<div className="tip-msg">{props.children}</div>
			<div className="center-box">
				<div id="treePlace" className="no-data-place">
					<Empty description="暂无云取应用" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
				<ul className="ztree" id="select-app-tree"></ul>
			</div>
		</Modal>
	);
};

CloudAppSelectModal.defaultProps = {
	visible: false,
	isMulti: true,
	selectedKeys: [],
	closeHandle: () => {},
	okHandle: ([]) => {}
};

export default connect((state: StateTree) => ({ dashboard: state.dashboard }))(CloudAppSelectModal);
