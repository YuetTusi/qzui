import React, { FC, useEffect, useState } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import { ITreeNode } from '@src/type/ztree';
import { helper } from '@src/utils/helper';
import { App, AppCategory } from '@src/schema/AppConfig';
import { CloudAppMessages, CloudAppState } from '@src/schema/socket/CloudAppMessages';
import { CaptchaMsg, SmsMessageType } from '../guide/CloudCodeModal/CloudCodeModalType';
import { Prop } from './CloudHistoryModalProps';
import './CloudHistoryModal.less';

let ztree: any = null;
const { fetchText } = helper.readConf();

/**
 * 将接口JSON数据转为zTree格式
 * @param arg0 属性
 */
function toTreeData(allCloudApps: AppCategory[], cloudApps: CloudAppMessages[]) {
	let rootNode: ITreeNode = {
		name: 'App',
		iconSkin: 'app_root',
		open: true,
		children: []
	};

	for (let i = 0; i < allCloudApps.length; i++) {
		const children = findApp(allCloudApps[i].app_list, cloudApps);
		if (children.length !== 0) {
			rootNode.children?.push({
				name: allCloudApps[i].desc,
				iconSkin: `type_${allCloudApps[i].name}`,
				open: true,
				children
			});
		}
	}
	return [rootNode];
}

/**
 * 查找云取应用结果中存在的应用，如果没有返回空数组
 * @param appsInCategory 分类下的应用
 * @param CloudAppMessages Fetch推送过来的云取应用结果
 */
function findApp(appsInCategory: App[], cloudApps: CloudAppMessages[]) {
	let children: ITreeNode[] = [];
	for (let i = 0; i < appsInCategory.length; i++) {
		let has = cloudApps.find((item) => item.m_strID === appsInCategory[i].app_id);
		if (has) {
			children.push({
				name: addColor(has.state, appsInCategory[i].desc),
				iconSkin: `app_${appsInCategory[i].app_id}`,
				open: false,
				appId: appsInCategory[i].app_id
			});
		}
	}
	return children;
}

/**
 * 着色
 */
function addColor(state: CloudAppState, text: string) {
	switch (state) {
		case CloudAppState.Fetching:
			return `<span style="color:#222;">${text}</span>`;
		case CloudAppState.Error:
			return `<span style="color:#dc143c;font-weight:bold;">${text}(失败)</span>`;
		case CloudAppState.Success:
			return `<span style="color:#23bb07;font-weight:bold;">${text}(成功)</span>`;
		default:
			return `<span style="color:#222;">${text}</span>`;
	}
}

/**
 * 云取证采集记录框
 * @param props
 */
const CloudHistoryModal: FC<Prop> = ({
	visible,
	device,
	cloudCodeModal,
	dashboard,
	cancelHandle
}) => {
	const [records, setRecords] = useState<CaptchaMsg[]>([]);

	/**
	 * 处理树组件数据
	 */
	useEffect(() => {
		const current = cloudCodeModal.devices[device.usb! - 1];
		if (current && current.apps && visible) {
			ztree = ($.fn as any).zTree.init(
				$('#cloud-app-tree'),
				{
					callback: {
						onClick: (event: any, treeId: string, treeNode: ITreeNode) => {
							const { appId } = treeNode;
							const clickApp = current.apps.find((item) => item.m_strID === appId);
							if (clickApp && clickApp.message) {
								setRecords(clickApp.message);
							} else {
								setRecords([]);
							}
						}
					},
					check: {
						enable: false
					},
					view: {
						nameIsHTML: true,
						showIcon: true
					}
				},
				toTreeData(dashboard.cloudAppData, current.apps)
			);
		}
		return () => {
			setRecords([]);
		};
	}, [visible]);

	const renderRecords = (msg: CaptchaMsg[]) => {
		if (msg && msg.length > 0) {
			const next = msg.map((item, i) => {
				switch (item.type) {
					case SmsMessageType.Normal:
						return (
							<li key={`L_${i}`} className="history-list-item">
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span style={{ color: '#222' }}>{item.content}</span>
							</li>
						);
					case SmsMessageType.Warning:
						return (
							<li key={`L_${i}`} className="history-list-item">
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span style={{ color: '#dc143c' }}>{item.content}</span>
							</li>
						);
					case SmsMessageType.Important:
						return (
							<li key={`L_${i}`} className="history-list-item">
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span style={{ color: '#416eb5' }}>{item.content}</span>
							</li>
						);
					default:
						return (
							<li key={`L_${i}`} className="history-list-item">
								<label>
									【{moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}】
								</label>
								<span>{item.content}</span>
							</li>
						);
				}
			});
			return (
				<div className="right-record">
					<ul className="history-list">{next}</ul>
				</div>
			);
		} else {
			return (
				<div className="right-record empty">
					<Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
			);
		}
	};

	return (
		<Modal
			footer={[
				<Button onClick={cancelHandle} icon="close-circle" type="default">
					取消
				</Button>
			]}
			onCancel={cancelHandle}
			visible={visible}
			className="cloud-history-modal-root"
			destroyOnClose={true}
			forceRender={true}
			maskClosable={false}
			width={850}
			title={`${fetchText ?? '采集'}记录`}>
			<div className="cloud-panel">
				<div className="left-tree">
					<ul className="ztree" id="cloud-app-tree"></ul>
				</div>
				{renderRecords(records)}
			</div>
		</Modal>
	);
};

CloudHistoryModal.defaultProps = {
	visible: false,
	cancelHandle: () => { }
};

//共用CloudCodeModal组件的Model
export default connect((state: StateTree) => ({
	cloudCodeModal: state.cloudCodeModal,
	dashboard: state.dashboard
}))(CloudHistoryModal);
