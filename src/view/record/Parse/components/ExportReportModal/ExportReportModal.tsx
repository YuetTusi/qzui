import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import React, { FC, memo, useEffect, useState } from 'react';
import $ from 'jquery';
import archiver from 'archiver';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { helper } from '@utils/helper';
import log from '@utils/log';
import { CopyTo, Prop } from './componentTypes';
import {
	expandNodes,
	filterTree,
	getAttachCopyTask,
	getAttachZipPath,
	mapTree,
	readTxtFile
} from './treeUtil';
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
	const [isAttach, setIsAttach] = useState<boolean>(false); //带附件
	const [isZip, setIsZip] = useState<boolean>(false); //压缩

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
					log.error(`读取tree.json数据失败: ${error.message}`);
				}
			})();
		}
	}, [props.visible]);

	/**
	 * 拷贝报告
	 * @param {string} source 源报告路径
	 * @param {string} distination 目标路径
	 * @param {string} folderName 导出文件夹名（默认为report）
	 * @returns {Promise<void>} 返回Promise
	 */
	const copyReport = async (
		source: string,
		distination: string,
		folderName: string = 'report'
	) => {
		const [tree, files, attaches] = filterTree(ztree.getNodes());

		// console.clear();
		// console.log(tree);
		// console.log(files);
		// console.log(attaches);
		let tasks = [
			helper.copyFiles(
				[
					'assert/**/*',
					'fonts/**/*',
					'public/default/**/*',
					'public/file/**/*',
					'public/icons/**/*',
					'index.html',
					'*.js'
				],
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
		];

		if (isAttach) {
			//todo: 在此处理拷贝附件
			const attachTasks = await getAttachCopyTask(source, distination, folderName, attaches);
			tasks = [...tasks, ...attachTasks];
		}

		await Promise.all(tasks);
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
	const compressReport = (
		source: string,
		distination: string,
		fileName: string = 'report.zip'
	) => {
		const archive = archiver('zip', {
			zlib: { level: 9 } //压缩级别
		});
		const ws = fs.createWriteStream(path.join(distination, fileName));
		const [tree, files, attaches] = filterTree(ztree.getNodes());

		return new Promise((resolve, reject) => {
			archive.once('error', (err) => reject(err));
			archive.once('finish', () => resolve(true));
			archive.pipe(ws);
			//报告所需基本文件
			archive.glob(
				'{assert/**/*,fonts/**/*,public/default/**/*,public/file/**/*,public/icons/**/*,index.html,*.js}',
				{
					cwd: source
				}
			);
			//用户所选数据JSON
			files.forEach((f) =>
				archive.file(path.join(source, 'public/data', f), { name: `public/data/${f}` })
			);
			//筛选子树JSON
			archive.append(Buffer.from(`;var data=${JSON.stringify(tree)}`), {
				name: 'public/data/tree.json'
			});
			if (isAttach) {
				//todo: 在此处理拷贝附件
				getAttachZipPath(source, attaches)
					.then((zipPaths) => {
						//附件
						zipPaths.forEach((i) =>
							archive.file(i.from, { name: path.join(i.to, i.rename) })
						);
						//开始压缩
						archive.finalize();
					})
					.catch((err) => {
						archive.abort();
						reject(err);
					});
			} else {
				//开始压缩
				archive.finalize();
			}
		});
	};

	/**
	 * 选择导出目录
	 */
	const selectExportDir = async () => {
		const selectVal = await dialog.showOpenDialog({
			title: '请选择保存目录',
			properties: ['openDirectory', 'createDirectory']
		});
		const { mobileHolder, mobileName } = props.device!;
		const reportName = `${mobileHolder}-${
			mobileName?.split('_')[0]
		}分析报告-${helper.timestamp()}`;
		if (selectVal.filePaths && selectVal.filePaths.length > 0) {
			const modal = Modal.info({
				content: isAttach
					? '正在导出，拷贝附件数据可能时间较长，请等待'
					: '正在导出报告... 请等待',
				okText: '确定',
				centered: true,
				maskClosable: false,
				okButtonProps: { disabled: true, icon: 'loading' }
			});

			const [saveTarget] = selectVal.filePaths; //用户所选目标目录
			const reportRoot = path.join(props.device?.phonePath!, 'report'); //当前报告目录

			try {
				if (isZip) {
					await compressReport(reportRoot, saveTarget, reportName + '.zip');
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
					<span onClick={() => setIsAttach((prev) => !prev)}>附件</span>
				</div>,
				<div className="checkbox-box">
					<Checkbox checked={isZip} onChange={() => setIsZip((prev) => !prev)} />
					<span onClick={() => setIsZip((prev) => !prev)}>压缩</span>
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
							message.info('请选择导出数据');
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
