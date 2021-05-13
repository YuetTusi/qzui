import React, { FC, useEffect } from 'react';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { request } from '@utils/request';
import { AppCategory } from '@src/schema/AppConfig';
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
	const { url, selectedKeys, isMulti } = props;

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
			(async () => {
				try {
					let { code, data } = await request<{ fetch: AppCategory[] }>(url);
					if (code === 0) {
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
							toAppTreeData(data.fetch, selectedKeys, isMulti)
						);
					} else {
						message.error('读取云应用接口数据失败');
					}
				} catch (error) {
					message.error('读取云应用接口数据失败');
				}
			})();
		}
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
				<div id="treePlace" className="no-data-place">
					<Empty description="云取应用为空" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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

export default CloudAppSelectModal;
