import fs from 'fs';
import path from 'path';
import { remote, OpenDialogReturnValue } from 'electron';
import React, { FC, useState } from 'react';
import Badge from 'antd/lib/badge';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Switch from 'antd/lib/switch';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import debounce from 'lodash/debounce';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { useMount } from '@src/hooks';
import { Prop } from './componentTypes';
import './Word.less';

const { app, dialog, shell } = remote;
const { Group } = Button;
const docPath = app.getPath('documents'); //文档位置
const appRoot = process.cwd();
let saveFolder = appRoot;
let defaultWordsPath = appRoot; //部队关键词模版目录
if (process.env['NODE_ENV'] === 'development') {
	saveFolder = path.join(appRoot, 'data/keywords');
	defaultWordsPath = path.join(appRoot, 'data/army');
} else {
	saveFolder = path.join(appRoot, 'resources/keywords');
	defaultWordsPath = path.join(appRoot, 'resources/army');
}

/**
 * 涉案词设置
 * @param props
 */
const Word: FC<Prop> = (props) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);
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
		(defaultPath?: string) => {
			dialog
				.showOpenDialog({
					defaultPath,
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

	/**
	 * 打开文件
	 */
	const openFileHandle = debounce(
		(file: string) => {
			let openPath = path.join(saveFolder, file);
			shell.openPath(openPath);
		},
		500,
		{ leading: true, trailing: false }
	);

	/**
	 * 删除文件handle
	 */
	const delFileHandle = (file: string) => {
		Modal.confirm({
			title: '删除',
			content: `确认删除「${file}」？`,
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
					style={{ marginTop: '18%' }}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			);
		} else {
			return fileList.map((file, index) => (
				<li key={`F_${index}`}>
					<a onClick={() => openFileHandle(file)}>{file}</a>
					<div>
						<Group>
							<Button
								onClick={() => openFileHandle(file)}
								size="small"
								type="default"
								icon="folder-open">
								打开
							</Button>
							<Button
								onClick={() => delFileHandle(file)}
								size="small"
								type="default"
								icon="delete">
								删除
							</Button>
						</Group>
					</div>
				</li>
			));
		}
	};

	/**
	 * 保存设置
	 */
	const saveHandle = () => {
		localStorage.setItem(LocalStoreKey.UseKeyword, isOpen ? '1' : '0');
		setIsDirty(false);
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
							onChange={() => {
								setIsOpen((prev) => !prev);
								setIsDirty(true);
							}}
							checkedChildren="开"
							unCheckedChildren="关"
						/>
						<Badge dot={isDirty}>
							<Button
								onClick={() => saveHandle()}
								style={{ marginLeft: '20px' }}
								type="primary"
								icon="save">
								保存
							</Button>
						</Badge>
					</div>

					<div>
						<Group>
							<Button
								onClick={() => selectFileHandle(docPath)}
								type="primary"
								icon="select">
								导入数据
							</Button>
							<Button
								onClick={() => selectFileHandle(defaultWordsPath)}
								type="primary"
								icon="select">
								导入模板
							</Button>
							<Button onClick={() => openFolder()} type="primary" icon="folder-open">
								打开位置
							</Button>
						</Group>
					</div>
				</div>
				<div className="excel-panel">
					<div className="caption">
						<Icon type="profile" />
						<span>关键词文件列表</span>
					</div>
					<div className="scroll-panel">
						<ul className="excel-list">{renderFileList()}</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Word;
