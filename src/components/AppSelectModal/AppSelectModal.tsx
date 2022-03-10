import React, { FC, useEffect } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { AppSelectModalProp } from './componentType';
import withModeButton from '../enhance';
import { toAppTreeData, addHoverDom, removeHoverDom } from './helper';
import './AppSelectModal.less';

const ModeButton = withModeButton()(Button);
let ztree: any = null;

/**
 * App选择弹框
 * @param props
 */
const AppSelectModal: FC<AppSelectModalProp> = ({
	treeData,
	selectedKeys,
	isMulti,
	title,
	children,
	visible,
	okHandle,
	closeHandle
}) => {
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
			toAppTreeData(treeData, selectedKeys, isMulti)
		);
	}, [visible]);

	return (
		<Modal
			visible={visible}
			footer={[
				<ModeButton onClick={closeHandle} type="default" icon="close-circle">
					取消
				</ModeButton>,
				<ModeButton
					onClick={() => {
						okHandle(ztree.getCheckedNodes());
					}}
					type="primary"
					icon="check-circle">
					确定
				</ModeButton>
			]}
			onCancel={closeHandle}
			title={title ?? '选择App'}
			forceRender={true}
			maskClosable={false}
			destroyOnClose={true}
			centered={true}
			zIndex={1001}
			className="app-select-modal-root">
			<div className="tip-msg">{children}</div>
			<div className="center-box">
				<ul className="ztree" id="select-app-tree"></ul>
			</div>
		</Modal>
	);
};

AppSelectModal.defaultProps = {
	visible: false,
	isMulti: true,
	treeData: [],
	selectedKeys: [],
	closeHandle: () => {},
	okHandle: ([]) => {}
};

export default AppSelectModal;
