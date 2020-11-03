import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import React, { FC, memo, useEffect, useRef, useState, MouseEvent } from 'react';
import $ from 'jquery';
import debounce from 'lodash/debounce';
import archiver from 'archiver';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import log from '@utils/log';
import { helper } from '@utils/helper';
import CompleteMsg from './CompleteMsg';
import { Prop } from './componentTypes';
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

const { dialog, shell } = remote;
let ztree: any = null;

/**
 * 导出报告框
 */
const ExportReportModal: FC<Prop> = (props) => {
	const [isAttach, setIsAttach] = useState<boolean>(false); //带附件
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

		await Promise.allSettled(tasks);
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
			zlib: { level: 7 } //压缩级别
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
	 * 打开保存目录所在窗口
	 * @param savePath 保存目录
	 */
	const openSavePathHandle = (savePath: string) => shell.showItemInFolder(savePath);

	/**
	 * 选择导出目录
	 */
	const selectExportDir = async () => {
		const { value } = nameInputRef.current!.input;
		const selectVal = await dialog.showOpenDialog({
			title: '请选择保存目录',
			properties: ['openDirectory', 'createDirectory']
		});
		const { mobileHolder, mobileName } = props.device!;

		let reportName = `${mobileHolder}-${
			mobileName?.split('_')[0]
		}分析报告-${helper.timestamp()}`;
		if (value.trim() !== '') {
			//若输入了报告名称，则使用输入内容
			reportName = value;
		}
		if (selectVal.filePaths && selectVal.filePaths.length > 0) {
			let exist = false;
			const [saveTarget] = selectVal.filePaths; //用户所选目标目录
			const reportRoot = path.join(props.device?.phonePath!, 'report'); //当前报告目录

			if (isZip) {
				exist = await helper.existFile(path.join(saveTarget, reportName + '.zip'));
			} else {
				exist = await helper.existFile(path.join(saveTarget, reportName));
			}

			if (exist) {
				let confirmDialog = Modal.confirm({
					title: '报告已存在',
					content: '是否覆盖现有文件？',
					okText: '是',
					cancelText: '否',
					centered: true,
					onOk() {
						confirmDialog.destroy();
						closeHandle();
						doExport(reportRoot, saveTarget, reportName);
					}
				});
			} else {
				closeHandle();
				doExport(reportRoot, saveTarget, reportName);
			}
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
				message.info('请选择导出数据');
			} else {
				selectExportDir();
			}
		},
		500,
		{ leading: true, trailing: false }
	);

	const closeHandle = () => {
		setIsAttach(false);
		setIsZip(false);
		props.closeHandle!();
	};

	/**
	 * 执行导出
	 * @param reportRoot 源报告路径
	 * @param saveTarget 保存目录
	 * @param reportName 报告名称
	 */
	const doExport = async (reportRoot: string, saveTarget: string, reportName: string) => {
		const loadingModal = Modal.info({
			content: isAttach
				? '正在导出... 拷贝附件数据所需时间较长，请等待'
				: '正在导出报告... 请等待',
			okText: '确定',
			centered: true,
			maskClosable: false,
			okButtonProps: { disabled: true, icon: 'loading' }
		});

		try {
			if (isZip) {
				await compressReport(reportRoot, saveTarget, reportName + '.zip');
			} else {
				await copyReport(reportRoot, saveTarget, reportName);
			}
			loadingModal.update({
				title: '导出成功',
				content: (
					<CompleteMsg
						fileName={reportName}
						savePath={path.join(saveTarget, isZip ? `${reportName}.zip` : reportName)}
						openHandle={openSavePathHandle}
					/>
				),
				okButtonProps: { disabled: false, icon: 'check-circle' }
			});
			// setTimeout(() => {
			// 	modal.destroy();
			// }, 600);
		} catch (error) {
			loadingModal.update({
				title: '导出失败',
				content: error.message,
				okButtonProps: { disabled: false, icon: 'check-circle' }
			});
		}
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

export default memo(ExportReportModal);
