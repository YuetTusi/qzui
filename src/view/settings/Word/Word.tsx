import fs from 'fs';
import path from 'path';
import { remote, OpenDialogReturnValue } from 'electron';
import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Switch from 'antd/lib/switch';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import debounce from 'lodash/debounce';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { useMount } from '@src/hooks';
import { Prop } from './componentTypes';
import './Word.less';

const { dialog, shell } = remote;
const { Group } = Button;
const appRoot = process.cwd();
let saveFolder = appRoot;
if (process.env['NODE_ENV'] === 'development') {
	saveFolder = path.join(appRoot, 'data/keywords');
} else {
	saveFolder = path.join(appRoot, 'resources/keywords');
}

/**
 * 涉案词设置
 * @param props
 */
const Word: FC<Prop> = (props) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [fileList, setFileList] = useState<string[]>([]);

	useMount(() => {
		let isOpen = localStorage.getItem(LocalStoreKey.UseKeyword) === '1';
		setIsOpen(isOpen);
	});

	useMount(async () => {
		let exist = await helper.existFile(saveFolder);
		if (!exist) {
			fs.mkdir(saveFolder, (err) => {});
		}

		loadFileList();
	});

	const selectFileHandle = debounce(
		() => {
			dialog
				.showOpenDialog({
					title: '选择Excel文件',
					properties: ['openFile', 'multiSelections'],
					filters: [{ name: 'Office Excel文档', extensions: ['xlsx'] }]
				})
				.then((val: OpenDialogReturnValue) => {
					if (val.filePaths.length > 0) {
						copyExcels(val.filePaths);
					}
				});
		},
		500,
		{ leading: true, trailing: false }
	);

	const openFolder = debounce(
		() => {
			let saveFolder = appRoot;
			if (process.env['NODE_ENV'] === 'development') {
				saveFolder = path.join(appRoot, 'data/keywords');
			} else {
				saveFolder = path.join(appRoot, 'resources/keywords');
			}
			shell.openPath(saveFolder);
		},
		500,
		{ leading: true, trailing: false }
	);

	const openFile = (file: string) => {
		let openPath = path.join(saveFolder, file);
		shell.openExternal(openPath);
	};

	const delFile = (file: string) => {
		Modal.confirm({
			title: '删除',
			content: '确认删除数据？',
			okText: '是',
			cancelText: '否',
			onOk() {
				let rmPath = path.join(saveFolder, file);
				fs.unlink(rmPath, (err) => {
					if (err) {
						console.log(rmPath);
						console.log(err);
						message.destroy();
						message.error('删除失败');
					} else {
						message.destroy();
						message.success('删除成功');
						loadFileList();
					}
				});
			}
		});
	};

	/**
	 * 拷贝Excel文件
	 */
	const copyExcels = (sources: string[]) => {
		helper.copyFiles(sources, saveFolder).then((data) => {
			message.success('导入成功');
			loadFileList();
		});
	};

	/**
	 * 读取文件列表
	 */
	const loadFileList = () => {
		fs.readdir(saveFolder, { encoding: 'utf8' }, (err, data) => {
			if (err) {
				message.error('读取文件列表失败');
			} else {
				setFileList(data);
			}
		});
	};

	const renderFileList = () => {
		if (fileList.length === 0) {
			return (
				<Empty
					description="暂无数据"
					style={{ marginTop: '10%' }}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			);
		} else {
			return fileList.map((file, index) => (
				<li key={`F_${index}`}>
					<a onClick={() => openFile(file)}>{file}</a>
					<div>
						<Group>
							<Button
								onClick={() => openFile(file)}
								size="small"
								type="primary"
								icon="folder-open"
							/>
							<Button
								onClick={() => delFile(file)}
								size="small"
								type="primary"
								icon="delete"
							/>
						</Group>
					</div>
				</li>
			));
		}
	};

	const saveHandle = () => {
		localStorage.setItem(LocalStoreKey.UseKeyword, isOpen ? '1' : '0');
		message.destroy();
		message.success('保存成功');
	};

	return (
		<div className="word-root">
			<div className="ct">
				<div className="button-bar">
					<div>
						<label>开启验证：</label>
						<Switch
							checked={isOpen}
							onChange={() => setIsOpen((prev) => !prev)}
							checkedChildren="开"
							unCheckedChildren="关"
						/>
						<Button
							onClick={() => saveHandle()}
							style={{ marginLeft: '20px' }}
							type="primary"
							icon="save">
							保存
						</Button>
					</div>

					<div>
						<Group>
							<Button onClick={() => selectFileHandle()} type="primary" icon="select">
								导入数据
							</Button>
							<Button onClick={() => selectFileHandle()} type="primary" icon="select">
								导入模板
							</Button>
							<Button onClick={() => openFolder()} type="primary" icon="folder-open">
								打开位置
							</Button>
						</Group>
					</div>
				</div>
				<div className="excel-panel">
					<div className="caption">文件列表</div>
					<div className="scroll-panel">
						<ul className="excel-list">{renderFileList()}</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Word;
