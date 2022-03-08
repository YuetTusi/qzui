import React, { FC, useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import { CloudExt } from '@src/schema/AppConfig';
import ExtModal from './ExtModal';
import withModeButton from '../enhance';
import { toAppTreeData, addHoverDom, removeHoverDom } from './helper';
import { CloudAppSelectModalProp } from './componentType';
import './AppSelectModal.less';

const ModeButton = withModeButton()(Button);
let ztree: any = null;

/**
 * 云取App选择弹框
 */
const CloudAppSelectModal: FC<CloudAppSelectModalProp> = ({
	visible, title, selectedKeys, isMulti, dashboard, children,
	okHandle, closeHandle, dispatch
}) => {

	const appId = useRef<string>();
	const setIds = useRef<string[]>([]); //存储设置的应用id值，用于选中树结点
	const extValues = useRef<{ [id: string]: CloudExt[] }>(Object.create(null));//项值
	const [extModalVisible, setExtModalVisible] = useState<boolean>(false);

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
		if (visible) {
			const { cloudAppData } = dashboard;
			let $treePlace = document.getElementById('treePlace');
			if ($treePlace) {
				$treePlace.remove();
			}
			ztree = ($.fn as any).zTree.init(
				$('#select-app-tree'),
				{
					check: checkOption,
					view: {
						nameIsHTML: true,
						showIcon: true,
						addHoverDom,
						removeHoverDom
					},
					callback: {
						beforeClick: () => false,
						// onCheck: (event: MouseEvent, treeId: string, node: ITreeNode[]) => {
						// 	console.log(node);
						// }
					}
				},
				toAppTreeData(cloudAppData, [...new Set([...selectedKeys, ...setIds.current])], isMulti)
			);
		}

	}, [visible, dashboard.cloudAppData]);

	useEffect(() => {

		if (visible) {
			$('.ext').on('click', function (event) {

				const $this = $(this);
				event.preventDefault();
				appId.current = $this.attr('data-id')!;
				try {
					const items = JSON.parse($this.attr('data-ext')!);
					extValues.current = {
						...extValues.current,
						[appId.current]: items
					};
				} catch (error) {
					console.warn(error);
				}
				setExtModalVisible(true);

				//TODO:在此通过id找到对应的云应用，根据配置文件的ext内容生成
				//TODO:相应的输入项，将值保存到state中

				//#举例：ext:[{name:'username',title:'用户名'}]
				//#将生成一个`用记名`的文本框，用户输入的值保存到对应的云应用中
				//#云取证时，如果有附加项的值，发送给fetch
			});
		}

	}, [visible, dashboard.cloudAppData]);


	/**
	 * 云应用附加项值
	 * @param id 应用id
	 * @param values 值 {username:"Tom",mail:"a@b.c"}
	 */
	const extHandle = (id: string, values: Record<string, string>) => {

		// console.log($(`a[data-id="${id}"]`).attr('data-ext'));
		const $target = $(`a[data-id="${id}"]`);
		try {
			const params = JSON.parse($target.attr('data-ext')!) as CloudExt[];
			for (let i = 0; i < params.length; i++) {
				if (values[params[i].name]) {
					params[i].value = values[params[i].name];
					dispatch({
						type: 'dashboard/setExtValue', payload: {
							app_id: id,
							name: params[i].name,
							value: values[params[i].name]
						}
					});
				}
			}
			//将用户所选和设置的应用id保存，下次打开和用户已勾选进行合体
			setIds.current.push(id, ...ztree.getCheckedNodes());
			$target.attr('data-ext', JSON.stringify(params));
		} catch (error) {
			console.warn(error);
		}
		setExtModalVisible(false);
	};

	return (
		<>
			<Modal
				visible={visible}
				footer={[
					<ModeButton onClick={() => {
						setIds.current = [];
						closeHandle();
					}} type="default" icon="close-circle">
						取消
					</ModeButton>,
					<ModeButton
						onClick={() => {
							setIds.current = [];
							okHandle(ztree.getCheckedNodes());
						}}
						type="primary"
						icon="check-circle">
						确定
					</ModeButton>
				]}
				onCancel={closeHandle}
				title={title ?? '选择App'}
				maskClosable={false}
				destroyOnClose={true}
				zIndex={1001}
				forceRender={true}
				style={{ top: 80 }}
				className="app-select-modal-root">
				<div className="tip-msg">{children}</div>
				<div className="center-box">
					<div id="treePlace" className="no-data-place">
						<Empty description="暂无云取应用" image={Empty.PRESENTED_IMAGE_SIMPLE} />
					</div>
					<ul className="ztree" id="select-app-tree"></ul>
				</div>
			</Modal>
			<ExtModal
				visible={extModalVisible}
				appId={appId.current!}
				ext={extValues.current[appId.current!]}
				okHandle={extHandle}
				closeHandle={() => {
					extValues.current = Object.create(null);
					setExtModalVisible(false);
				}}>

			</ExtModal>
		</>
	);
};

CloudAppSelectModal.defaultProps = {
	visible: false,
	isMulti: true,
	selectedKeys: [],
	closeHandle: () => { },
	okHandle: ([]) => { }
};

export default connect((state: StateTree) => ({ dashboard: state.dashboard }))(CloudAppSelectModal);
