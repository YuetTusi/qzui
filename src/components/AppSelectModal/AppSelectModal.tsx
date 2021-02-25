import React, { FC, useEffect } from 'react';
import $ from 'jquery';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { Prop } from './componentType';
import withModeButton from '../enhance';
import { toTreeData } from './helper';
import '@ztree/ztree_v3/js/jquery.ztree.all.min';
import './AppSelectModal.less';

const ModeButton = withModeButton()(Button);
let ztree: any = null;

/**
 * App选择弹框
 * @param props
 */
const AppSelectModal: FC<Prop> = (props) => {
	/**
	 * 处理树组件数据
	 */
	useEffect(() => {
		ztree = ($.fn as any).zTree.init(
			$('#select-app-tree'),
			{
				check: {
					enable: true
				},
				view: {
					showIcon: true
				}
			},
			toTreeData(props)
		);
	}, [props.visible]);

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
			forceRender={true}
			maskClosable={false}
			destroyOnClose={true}
			zIndex={1001}
			style={{ top: 80 }}
			className="app-select-modal-root">
			<div className="tip-msg">{props.children}</div>
			<div className="center-box">
				<ul className="ztree" id="select-app-tree"></ul>
			</div>
		</Modal>
	);
};

AppSelectModal.defaultProps = {
	visible: false,
	treeData: [],
	selectedKeys: [],
	closeHandle: () => {},
	okHandle: ([]) => {}
};

export default AppSelectModal;
