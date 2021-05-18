import path from 'path';
import { remote, ipcRenderer } from 'electron';
import React, { FC, useEffect, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { StateTree } from '@src/type/model';
import { ITreeNode } from '@src/type/ztree';
import { helper } from '@utils/helper';
import { readTreeJson, toTreeData, filterTree } from './helper';
import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';
import { Prop, ReportExportTask } from './componentType';
import './BatchExportReportModal.less';

const { dialog } = remote;
let ztree: any = null;

/**
 * 批量导出报告
 */
const BatchExportReportModal: FC<Prop> = (props) => {
	const { visible, cancelHandle, batchExportReportModal } = props;

	const [isAttach, setIsAttach] = useState(true); //是否带附件
	const [isEmpty, setIsEmpty] = useState(true); //是否为空

	/**
	 * 验证勾选
	 */
	const validCheck = (e: MouseEvent<HTMLButtonElement>) => {
		const devices: ITreeNode[] = ztree
			.getCheckedNodes()
			.filter((item: ITreeNode) => item.level === 1);
		if (devices.length === 0) {
			message.destroy();
			message.info('请选择报告');
			return;
		} else {
			selectExportDir(devices);
		}
	};

	/**
	 * 选择导出目录
	 */
	const selectExportDir = debounce(
		async (devices: ITreeNode[]) => {
			const { dispatch } = props;

			let exportTasks: ReportExportTask[] = [];

			const selectVal = await dialog.showOpenDialog({
				title: '请选择保存目录',
				properties: ['openDirectory', 'createDirectory']
			});

			if (selectVal.filePaths && selectVal.filePaths.length > 0) {
				const [saveTarget] = selectVal.filePaths; //用户所选目标目录

				message.info('开始导出报告...');
				cancelHandle();

				const prepared = devices.map((d) => {
					let treeJson = path.join(d.phonePath, './report/public/data/tree.json');
					const next = {
						phonePath: d.phonePath as string,
						mobileName: d.mobileName as string,
						mobileHolder: d.mobileHolder as string,
						treeJsonReader: readTreeJson(treeJson) as Promise<any>
					};
					return next;
				});

				for (let i = 0, l = prepared.length; i < l; i++) {
					const { phonePath, mobileHolder, mobileName, treeJsonReader } = prepared[i];
					const treeJson = await treeJsonReader;
					// console.log(treeJson);
					const [tree, files, attaches] = filterTree(treeJson);
					const [name, timestamp] = mobileName.split('_');
					//每一个task即一个导出任务
					exportTasks = exportTasks.concat({
						reportRoot: path.join(phonePath, './report'),
						saveTarget,
						reportName: `${mobileHolder}-${name}分析报告-${timestamp}`,
						tree,
						files,
						attaches
					} as ReportExportTask);
				}

				const id = helper.newId();
				const msg = new AlarmMessageInfo({
					id,
					msg: `正在批量导出报告`
				});
				dispatch({
					type: 'dashboard/addAlertMessage',
					payload: msg
				});
				dispatch({ type: 'innerPhoneTable/setExportingDeviceId', payload: id });
				ipcRenderer.send('report-batch-export', exportTasks, isAttach, false, msg.id);
				ipcRenderer.send('show-progress', true);
			}
		},
		500,
		{ trailing: false, leading: true }
	);

	useEffect(() => {
		if (props.visible) {
			(async () => {
				const treeNodes = await toTreeData(
					batchExportReportModal.caseName,
					batchExportReportModal.devices
				);
				if (treeNodes.children && treeNodes.children.length === 0) {
					setIsEmpty(true);
				} else {
					ztree = ($.fn as any).zTree.init(
						$('#reportTree'),
						{
							check: {
								enable: true
							},
							view: {
								nameIsHTML: true,
								showIcon: false
							}
						},
						treeNodes
					);
					ztree.checkAllNodes(true);
					ztree.expandAll(true);
					setIsEmpty(false);
				}
			})();
		}
	}, [props.visible, props.batchExportReportModal.devices]);

	return (
		<Modal
			footer={[
				<div className="control-boxes">
					<Checkbox checked={isAttach} onChange={() => setIsAttach((prev) => !prev)} />
					<span onClick={() => setIsAttach((prev) => !prev)}>附件</span>
				</div>,
				<Button
					// disabled={exporting}
					icon={'export'}
					onClick={validCheck}
					type="primary">
					导出
				</Button>
			]}
			onCancel={() => {
				setIsAttach(true);
				cancelHandle();
			}}
			visible={visible}
			title="批量导出报告"
			destroyOnClose={true}
			maskClosable={false}
			className="batch-export-report-modal-root">
			<fieldset className="batch-export-tips">
				<legend>批量导出提示</legend>
				<div>
					<ul>
						<li>
							导出目录若存在<em>相同文件会覆盖</em>，请确认
						</li>
						<li>
							无报告数据请进行<em>生成报告</em>操作
						</li>
						<li>批量导出报告数据过大会较慢，请等待</li>
					</ul>
				</div>
			</fieldset>
			<div className="export-panel">
				<ul
					style={{ display: isEmpty ? 'none' : 'block' }}
					id="reportTree"
					className="ztree"></ul>
				<div style={{ display: isEmpty ? 'flex' : 'none' }} className="empty-report">
					<Empty description="暂无报告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
			</div>
		</Modal>
	);
};

export default connect((state: StateTree) => ({
	batchExportReportModal: state.batchExportReportModal,
	innerPhoneTable: state.innerPhoneTable
}))(BatchExportReportModal);
