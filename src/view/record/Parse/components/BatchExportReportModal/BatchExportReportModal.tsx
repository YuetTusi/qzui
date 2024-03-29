import path from 'path';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
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
import { toTreeData, filterTree, setDefaultChecked } from './helper';
import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';
import { Prop, ReportExportTask } from './componentType';
import './BatchExportReportModal.less';

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

			const selectVal: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
				title: '请选择保存目录',
				properties: ['openDirectory', 'createDirectory']
			});

			if (selectVal.filePaths && selectVal.filePaths.length > 0) {
				const [saveTarget] = selectVal.filePaths; //用户所选目标目录

				message.info('开始导出报告...');
				cancelHandle();

				const prepared = devices.map((d) => {
					const next = {
						tId: d.tId as string,
						deviceId: d.deviceId as string,
						phonePath: d.phonePath as string,
						mobileName: d.mobileName as string,
						mobileHolder: d.mobileHolder as string,
						mobileNo: d.mobileNo as string
					};
					return next;
				});

				for (let i = 0, l = prepared.length; i < l; i++) {
					const { tId, deviceId, phonePath, mobileHolder, mobileName, mobileNo } = prepared[i];
					const nodes = ztree.getNodeByTId(tId);
					const [tree, files, attaches] = filterTree(nodes.children);
					const [name, timestamp] = mobileName.split('_');

					if (tree && tree.length > 0) {
						//还原原案件名称
						let [onlyName] = (batchExportReportModal.caseName ?? '').split('_');
						tree[0].name = onlyName;
					}
					//每一个task即一个导出任务
					exportTasks = exportTasks.concat({
						deviceId,
						reportRoot: path.join(phonePath, './report'),
						saveTarget,
						reportName: `${mobileHolder}-${name}${helper.isNullOrUndefinedOrEmptyString(mobileNo) ? '' : '-' + mobileNo}-${timestamp}`,
						tree,
						files,
						attaches
					} as ReportExportTask);
				}

				const msg = new AlarmMessageInfo({
					id: helper.newId(),
					msg: `正在批量导出报告`
				});
				dispatch({
					type: 'dashboard/addAlertMessage',
					payload: msg
				});
				dispatch({
					type: 'innerPhoneTable/setExportingDeviceId',
					payload: exportTasks.map((i) => i.deviceId)
				});
				ipcRenderer.send('report-batch-export', exportTasks, isAttach, false, msg.id);
				ipcRenderer.send('show-progress', true);
			}
		},
		500,
		{ trailing: false, leading: true }
	);

	useEffect(() => {
		if (visible) {
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
					setDefaultChecked(ztree);
					setIsEmpty(false);
				}
			})();
		}
	}, [visible, batchExportReportModal]);

	return (
		<Modal
			footer={[
				<div className="control-boxes">
					<Checkbox
						checked={isAttach}
						disabled={isEmpty}
						onChange={() => setIsAttach((prev) => !prev)}
					/>
					<span
						onClick={() => {
							if (!isEmpty) {
								setIsAttach((prev) => !prev);
							}
						}}>
						附件
					</span>
				</div>,
				<Button disabled={isEmpty} icon={'export'} onClick={validCheck} type="primary">
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
							无报告数据请先进行<em>生成报告</em>操作
						</li>
						<li>
							请保证磁盘空间充足；数据过大会较慢，导出过程中<em>请勿关闭应用</em>
						</li>
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

BatchExportReportModal.defaultProps = {
	visible: false,
	cancelHandle: () => { }
};

export default connect((state: StateTree) => ({
	batchExportReportModal: state.batchExportReportModal,
	innerPhoneTable: state.innerPhoneTable
}))(BatchExportReportModal);
