import fs from 'fs';
import path from 'path';
import { OpenDialogReturnValue, remote } from 'electron';
import React, { FC, memo, useEffect, useState } from 'react';
import $ from 'jquery';
import archiver from 'archiver';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { helper } from '@src/utils/helper';
import { Prop } from './componentTypes';
import { expandNodes, filterTree, mapTree, readTxtFile } from './treeUtil';
import '@ztree/ztree_v3/js/jquery.ztree.all.min';
import '@ztree/ztree_v3/css/zTreeStyle/zTreeStyle.css';
import '@src/styles/ztree-overwrite.less';
import './ExportReportModal.less';

let ztree: any = null;

/**
 * 拷贝报告
 * @param {string} source 源报告路径
 * @param {string} distination 目标路径
 * @param {string} folderName 导出文件夹名（默认为report）
 * @returns {Promise<void>} 返回Promise
 */
const copyReport = async (source: string, distination: string, folderName: string = 'report') => {
	const [tree, files] = filterTree(ztree.getNodes());

	await Promise.all([
		helper.copyFiles(
			['assert/**/*', 'fonts/**/*', 'public/images/**/*', 'index.html', '*.js'],
			path.join(distination, folderName),
			{
				parents: true,
				cwd: source
			}
		),
		helper.copyFiles(
			files.map((f) => path.join(source, 'public/data', f)),
			path.join(distination, folderName, 'public/data')
		)
	]);
	await helper.writeJSONfile(
		path.join(distination, folderName, 'public/data/tree.json'),
		`;var data=${JSON.stringify(tree)}`
	);
};

/**
 * 压缩报告
 * @param {string} source 源报告路径
 * @param {string} distination 目标路径
 * @param {string} fileName 导出文件名（默认为report.zip）
 * @returns {Promise<boolean>} 返回Promise
 */
const zipReport = (source: string, distination: string, fileName: string = 'report.zip') => {
	const archive = archiver('zip', {
		zlib: { level: 3 } //压缩级别
	});
	const ws = fs.createWriteStream(path.join(distination, fileName));

	return new Promise<boolean>((resolve, reject) => {
		const [tree, files] = filterTree(ztree.getNodes());
		archive.on('error', (err) => reject(err));
		archive.on('finish', () => resolve(true));

		archive.pipe(ws);
		//报告所需基本文件
		archive.glob('{assert/**/*,fonts/**/*,public/images/**/*,index.html,*.js}', {
			cwd: source
		});
		//用户所选数据JSON
		files.forEach((f) =>
			archive.file(path.join(source, 'public/data', f), { name: `public/data/${f}` })
		);
		//筛选后的树JSON
		archive.append(Buffer.from(`;var data=${JSON.stringify(tree)}`), {
			name: 'public/data/tree.json'
		});
		//开始压缩
		archive.finalize();
	});
};

/**
 * 导出报告框
 */
const ExportReportModal: FC<Prop> = (props) => {
	const [isAttach, setIsAttach] = useState<boolean>(false);
	const [isZip, setIsZip] = useState<boolean>(false);

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

	/**
	 * 选择导出目录
	 */
	const selectExportDir = () => {
		remote.dialog
			.showOpenDialog({
				title: '请选择保存目录',
				properties: ['openDirectory', 'createDirectory']
			})
			.then(async (val: OpenDialogReturnValue) => {
				const { mobileHolder, mobileName } = props.device!;
				const reportName = `${mobileHolder}-${mobileName?.split('_')[0]}分析报告`;
				if (val.filePaths && val.filePaths.length > 0) {
					const modal = Modal.info({
						content: '正在导出报告... 可能时间较长，请等待',
						okText: '确定',
						maskClosable: false,
						okButtonProps: { disabled: true, icon: 'loading' }
					});

					const [saveTarget] = val.filePaths; //用户所选目标目录
					const reportRoot = path.join(props.device?.phonePath!, 'report'); //当前报告目录

					try {
						if (isZip) {
							await zipReport(reportRoot, saveTarget, reportName + '.zip');
						} else {
							await copyReport(reportRoot, saveTarget, reportName);
						}
						closeHandle();
						modal.update({
							content: '导出报告成功',
							okButtonProps: { disabled: false, icon: 'check-circle' }
						});
						setTimeout(() => {
							modal.destroy();
						}, 600);
					} catch (error) {
						modal.update({
							title: '导出失败',
							content: error.message,
							okButtonProps: { disabled: false, icon: 'check-circle' }
						});
					}
				}
			});
	};

	const closeHandle = () => {
		setIsAttach(false);
		setIsZip(false);
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
				<div className="checkbox-box">
					<Checkbox checked={isZip} onChange={() => setIsZip((prev) => !prev)} />
					<span>压缩报告</span>
				</div>,
				<Button type="default" icon="close-circle" onClick={closeHandle}>
					取消
				</Button>,
				<Button
					type="primary"
					icon="export"
					onClick={async () => {
						let [, files] = filterTree(ztree.getNodes());
						if (files.length === 0) {
							message.destroy();
							message.info('请选择报告数据');
						} else {
							selectExportDir();
						}
					}}>
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

export default memo(ExportReportModal);
