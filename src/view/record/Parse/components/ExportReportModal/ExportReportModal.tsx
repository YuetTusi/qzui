import path from 'path';
import React, { FC, useEffect, useState } from 'react';
import $ from 'jquery';
import cpy from 'cpy';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import { Prop } from './componentTypes';
import '@ztree/ztree_v3/js/jquery.ztree.all.min';
import '@ztree/ztree_v3/css/zTreeStyle/zTreeStyle.css';
import './ExportReportModal.less';
import { expandNodes, filterTree, mapTree, readTxtFile } from './treeUtil';

let ztree: any = null;

/**
 * 导出报告框
 */
const ExportReportModal: FC<Prop> = (props) => {
	const [isAttach, setIsAttach] = useState<boolean>(false);

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
						$('#tree'),
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
					expandNodes(ztree, ztree.getNodes(), 3);
				} catch (error) {
					console.log(error);
				}
			})();
		}
	}, [props.visible]);

	const closeHandle = () => {
		props.closeHandle!();
	};

	return (
		<Modal
			visible={props.visible}
			footer={[
				<div className="checkbox-box">
					<Checkbox checked={isAttach} onChange={() => setIsAttach((prev) => !prev)} />
					<span>包含附件</span>
				</div>,
				<Button type="default" icon="close-circle" onClick={closeHandle}>
					取消
				</Button>,
				<Button
					type="primary"
					icon="export"
					onClick={() => {
						let [tree, files] = filterTree(ztree.getNodes());
						const reportDataPath = path.join(
							props.device?.phonePath!,
							'report/public/data'
						);
						Promise.all([
							helper.writeJSONfile(
								'E:/target/tree.json',
								`;var data=${JSON.stringify(tree)}`
							),
							cpy(
								files.map((f) => path.join(reportDataPath, f)),
								'E:/target'
							)
						])
							.then(() => console.log('拷贝完成'))
							.catch((err) => console.log(err));
					}}>
					导出
				</Button>
			]}
			onCancel={closeHandle}
			title="导出报告"
			width={650}
			maskClosable={false}
			className="export-report-modal-root">
			<div className="export-panel">
				<div className="top-bar"></div>
				<div className="center-box">
					<ul id="tree" className="ztree"></ul>
				</div>
			</div>
		</Modal>
	);
};

ExportReportModal.defaultProps = {
	visible: false,
	closeHandle: () => {}
};

export default ExportReportModal;
