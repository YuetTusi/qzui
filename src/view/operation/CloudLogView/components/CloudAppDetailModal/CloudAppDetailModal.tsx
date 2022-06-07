import React, { FC, useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { StateTree } from '@src/type/model';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { ITreeNode } from '@src/type/ztree';
import { helper } from '@src/utils/helper';
import { App } from '@src/schema/AppConfig';
import { CloudAppMessages, CloudAppState } from '@src/schema/socket/CloudAppMessages';
import { withModeButton } from '@src/components/enhance';
import {
	CaptchaMsg,
	SmsMessageType
} from '@src/components/guide/CloudCodeModal/CloudCodeModalType';
import { CloudAppDetailModalProps } from './CloudAppDetailModalProps';
import './CloudAppDetailModal.less';

const { fetchText } = helper.readConf();
const ModeButton = withModeButton()(Button);

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
 * 云取应用详情框
 */
const CloudAppDetailModal: FC<CloudAppDetailModalProps> = ({
	visible,
	apps,
	dashboard,
	cancelHandle
}) => {
	const [records, setRecords] = useState<CaptchaMsg[]>([]);

	/**
	 * 处理树组件数据
	 */
	useEffect(() => {
		if (visible) {
			setTimeout(() => {
				($.fn as any).zTree.init(
					$('#detail-app-tree'),
					{
						callback: {
							onClick: (event: any, treeId: string, treeNode: ITreeNode) => {
								const { appId } = treeNode;
								const clickApp = apps.find((item) => item.m_strID === appId);
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
					toTreeData(apps)
				);
			}, 0);
		}
		return () => {
			setRecords([]);
		};
	}, [visible]);

	/**
	 * 将yaml中JSON数据转为zTree格式
	 * @param arg0 属性
	 */
	const toTreeData = useCallback(
		(cloudApps: CloudAppMessages[]) => {
			const { cloudAppData } = dashboard;

			let rootNode: ITreeNode = {
				name: 'App',
				iconSkin: 'app_root',
				open: true,
				children: []
			};

			for (let i = 0, l = cloudAppData.length; i < l; i++) {
				const children = findApp(cloudAppData[i].app_list, cloudApps);
				if (children.length !== 0) {
					rootNode.children?.push({
						name: cloudAppData[i].desc,
						iconSkin: `type_${cloudAppData[i].name}`,
						open: true,
						children
					});
				}
			}
			return [rootNode];
		},
		[dashboard.cloudAppData]
	);

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
			visible={visible}
			footer={[
				<ModeButton onClick={cancelHandle} type="default" icon="close-circle">
					取消
				</ModeButton>
			]}
			title={`${fetchText ?? '采集'}记录`}
			onCancel={cancelHandle}
			destroyOnClose={true}
			maskClosable={false}
			width={850}
			className="cloud-app-detail-modal-root">
			<div className="cloud-panel">
				<div className="left-tree">
					<ul id="detail-app-tree" className="ztree"></ul>
				</div>
				{renderRecords(records)}
			</div>
		</Modal>
	);
};

export default connect((state: StateTree) => ({ dashboard: state.dashboard }))(CloudAppDetailModal);
