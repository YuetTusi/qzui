import path from 'path';
import { ipcRenderer, remote } from 'electron';
import React, { FC, memo, useEffect, useRef, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';
import { Prop } from './componentTypes';
import { expandNodes, filterTree, mapTree, readTxtFile } from './treeUtil';
import '@ztree/ztree_v3/js/jquery.ztree.all.min';
import '@ztree/ztree_v3/css/zTreeStyle/zTreeStyle.css';
import '@src/styles/ztree-overwrite.less';
import './ExportReportModal.less';

const { dialog } = remote;
let ztree: any = null;

/**
 * 导出报告框
 */
const ExportReportModal: FC<Prop> = (props) => {
	const [isAttach, setIsAttach] = useState<boolean>(true); //带附件
	const [isZip, setIsZip] = useState<boolean>(false); //压缩
	const nameInputRef = useRef<Input>(null); //重命名Input引用

	/**
	 * 处理树组件数据
	 */
	useEffect(() => {
		if (props.visible) {
			const treeJsonPath = path.join(
				props.device?.phonePath!,
				'report/public/data/tree.json'
			);
			(async () => {
				try {
					let fakeJson = await readTxtFile(treeJsonPath);
					let startPos = fakeJson.indexOf('=') + 1;
					let zTreeData = JSON.parse(fakeJson.substring(startPos));

					ztree = ($.fn as any).zTree.init(
						$('#report-tree'),
						{
							check: {
								enable: true
							},
							view: {
								nameIsHTML: true,
								showIcon: false
							}
						},
						mapTree(zTreeData)
					);
					ztree.checkAllNodes(true);
					expandNodes(ztree, ztree.getNodes(), 3);
				} catch (error) {
					message.error('加载报告数据失败');
					console.log(`加载报告数据失败:${error.message}`);
					log.error(
						`读取报告tree.json数据失败 @view/record/Parse/ExportReportModal: ${error.message}`
					);
				}
			})();
		}
	}, [props.visible]);

	/**
	 * 选择导出目录
	 */
	const selectExportDir = async () => {
		const { dispatch } = props;
		const { value } = nameInputRef.current!.input;
		const selectVal = await dialog.showOpenDialog({
			title: '请选择保存目录',
			properties: ['openDirectory', 'createDirectory']
		});
		const { mobileHolder, mobileName, id } = props.device!;

		let reportName = `${mobileHolder}-${
			mobileName?.split('_')[0]
		}分析报告-${helper.timestamp()}`;
		if (value.trim() !== '') {
			//若输入了报告名称，则使用输入内容
			reportName = value;
		}
		if (selectVal.filePaths && selectVal.filePaths.length > 0) {
			const [saveTarget] = selectVal.filePaths; //用户所选目标目录
			const reportRoot = path.join(props.device?.phonePath!, 'report'); //当前报告目录

			message.info('开始导出报告...');
			const msg = new AlarmMessageInfo({
				id: helper.newId(),
				msg: `正在导出「${reportName}」`
			});
			dispatch({
				type: 'dashboard/addAlertMessage',
				payload: msg
			});
			dispatch({ type: 'innerPhoneTable/setExportingDeviceId', payload: id });
			closeHandle();
			let [tree, files, attaches] = filterTree(ztree.getNodes());
			ipcRenderer.send(
				'report-export',
				{
					reportRoot,
					saveTarget,
					reportName,
					isZip,
					isAttach
				},
				{
					tree,
					files,
					attaches
				},
				msg.id
			);
			ipcRenderer.send('show-progress', true);
		}
	};

	/**
	 * 导出报告handle
	 */
	const exportHandle = debounce(
		(e: MouseEvent<HTMLButtonElement>) => {
			let [, files] = filterTree(ztree.getNodes());
			if (files.length === 0) {
				message.destroy();
				message.info('请选择报告数据');
			} else {
				selectExportDir();
			}
		},
		500,
		{ leading: true, trailing: false }
	);

	const closeHandle = () => {
		setIsAttach(true);
		setIsZip(false);
		props.closeHandle!();
	};

	return (
		<Modal
			visible={props.visible}
			footer={[
				<div className="control-boxes">
					<label htmlFor="reportName">重命名：</label>
					<Input
						ref={nameInputRef}
						placeholder="请输入导出报告文件名"
						name="reportName"
						size="small"
						maxLength={100}
					/>
				</div>,
				<div className="control-boxes">
					<Checkbox checked={isAttach} onChange={() => setIsAttach((prev) => !prev)} />
					<span onClick={() => setIsAttach((prev) => !prev)}>附件</span>
				</div>,
				<div className="control-boxes">
					<Checkbox checked={isZip} onChange={() => setIsZip((prev) => !prev)} />
					<span onClick={() => setIsZip((prev) => !prev)}>压缩</span>
				</div>,
				<Button type="primary" icon="export" onClick={exportHandle}>
					导出
				</Button>
			]}
			onCancel={closeHandle}
			title="导出报告"
			width={650}
			maskClosable={false}
			destroyOnClose={true}
			className="export-report-modal-root">
			<div className="export-panel">
				<div className="top-bar"></div>
				<div className="center-box">
					<ul id="report-tree" className="ztree"></ul>
				</div>
			</div>
		</Modal>
	);
};

ExportReportModal.defaultProps = {
	visible: false,
	closeHandle: () => {}
};

export default memo(connect()(ExportReportModal));
