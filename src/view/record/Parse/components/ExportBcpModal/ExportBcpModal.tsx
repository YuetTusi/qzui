import path from 'path';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { StateTree } from '@src/type/model';
import { ITreeNode } from '@src/type/ztree';
import { Prop } from './ExportBcpModalProp';
import './ExportBcpModal.less';

let ztree: any = null;

/**
 * 查询案件下的设备
 * @param caseId 案件id
 */
const queryDevice = async (caseId: string) => {
	let devices: DeviceType[] = [];
	try {
		devices = await ipcRenderer.invoke('db-find', TableName.Device, { caseId });
	} catch (error) {
		log.error(`查询设备失败 @view/Parse/ExportBcpModal/queryDevice: ${error.message}`);
	}
	return devices;
};

/**
 * 返回zTree数据
 * @param isBatch 是否是批量
 * @param caseData 案件数据
 * @param devices 设备数据
 */
const toTreeData = async (isBatch: boolean, caseData: CCaseInfo, device: DeviceType) => {
	if (isBatch) {
		//批量
		const devicesInCase = await queryDevice(caseData._id!); //查询案件下的设备
		let deviceNodes = await mapDeviceToTree(devicesInCase);
		let rootNode: ITreeNode = {
			name: caseData.m_strCaseName.split('_')[0],
			children: deviceNodes
		};
		return rootNode;
	} else {
		//非批量
		let bcpNodes = await readBcpFiles(device.phonePath!);
		let [onlyName] = device.mobileName!.split('_');
		let rootNode: ITreeNode = {
			name: `${onlyName}（${device.mobileHolder}）`,
			children: bcpNodes
		};
		return rootNode;
	}
};

/**
 * 返回设备下的BCP文件node
 * @param devices 设备
 */
const mapDeviceToTree = async (devices: DeviceType[]) => {
	let nodes: ITreeNode[] = [];
	for (let i = 0; i < devices.length; i++) {
		const { phonePath, mobileName, mobileHolder } = devices[i];
		const [onlyName] = mobileName!.split('_');
		const bcpFiles = await readBcpFiles(phonePath!);
		if (bcpFiles !== undefined) {
			nodes = nodes.concat([
				{
					name: `${onlyName}（${mobileHolder}）`,
					children: bcpFiles
				}
			]);
		}
	}
	return nodes;
};

/**
 * 读取手机目录下的BCP文件
 * @param phonePath 设备（手机）路径
 */
const readBcpFiles = async (phonePath: string): Promise<ITreeNode[] | undefined> => {
	const bcpPath = path.join(phonePath, 'BCP'); //BCP目录
	const exist = await helper.existFile(bcpPath);
	if (exist) {
		const files = await helper.readDir(bcpPath);
		if (files.length === 0) {
			return undefined;
		} else {
			return files.map((i) => ({ name: i, value: path.join(bcpPath, i) }));
		}
	} else {
		return undefined;
	}
};

/**
 * 批量导出BCP框
 * @param props
 */
const ExportBcpModal: FC<Prop> = (props) => {
	const { exporting, isBatch, exportBcpCase, exportBcpDevice } = props.exportBcpModal;

	const [isEmpty, setIsEmpty] = useState<boolean>(false); //BCP文件是否为空

	useEffect(() => {
		(async () => {
			if (props.visible) {
				const treeNodes = await toTreeData(isBatch, exportBcpCase, exportBcpDevice);
				setIsEmpty(treeNodes.children!.length === 0);

				ztree = ($.fn as any).zTree.init(
					$('#bcp-tree'),
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
			}
		})();
	}, [props.visible]);

	/**
	 * 导出事件handle
	 */
	const exportHandle = debounce(
		async (event: MouseEvent<HTMLButtonElement>) => {
			const bcpNodeLevel = isBatch ? 2 : 1;
			const bcpPathList = ztree
				.getCheckedNodes()
				.filter((node: ITreeNode) => node.level === bcpNodeLevel)
				.map((i: ITreeNode) => i.value);
			if (bcpPathList.length !== 0) {
				const selectVal: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
					title: '请选择保存目录',
					properties: ['openDirectory', 'createDirectory']
				});
				if (selectVal.filePaths && selectVal.filePaths.length > 0) {
					props.okHandle(bcpPathList, selectVal.filePaths[0]);
				}
			} else {
				message.destroy();
				message.info('请选择BCP文件');
			}
		},
		400,
		{ leading: true, trailing: false }
	);

	const cancelHandle = (event: MouseEvent<HTMLButtonElement>) => props.cancelHandle();

	return (
		<Modal
			footer={[
				<Button onClick={cancelHandle} icon="close-circle">
					取消
				</Button>,
				<Button
					disabled={exporting}
					icon={exporting ? 'loading' : 'export'}
					onClick={exportHandle}
					type="primary">
					导出
				</Button>
			]}
			onCancel={props.cancelHandle}
			visible={props.visible}
			title="导出BCP"
			maskClosable={false}
			destroyOnClose={true}
			className="export-bcp-modal-root">
			<div className="export-panel">
				<ul
					id="bcp-tree"
					className="ztree"
					style={{ display: isEmpty ? 'none' : 'block' }}></ul>
				<div className="empty-bcp" style={{ display: isEmpty ? 'flex' : 'none' }}>
					<Empty description="暂无BCP文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</div>
			</div>
		</Modal>
	);
};

ExportBcpModal.defaultProps = {
	visible: false,
	okHandle: () => {},
	cancelHandle: () => {}
};

export default connect((state: StateTree) => ({ exportBcpModal: state.exportBcpModal }))(
	ExportBcpModal
);
