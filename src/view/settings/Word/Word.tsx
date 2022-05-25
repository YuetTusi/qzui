import { mkdir, unlink } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import debounce from 'lodash/debounce';
import { ipcRenderer, shell, OpenDialogReturnValue } from 'electron';
import React, { FC, memo, useState } from 'react';
import Badge from 'antd/lib/badge';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Switch from 'antd/lib/switch';
import Tooltip from 'antd/lib/tooltip';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { useMount } from '@src/hooks';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import AddCategoryModal from './AddCategoryModal';
import { Prop } from './componentTypes';
import './Word.less';

const cwd = process.cwd();
const { Group } = Button;
let saveFolder = cwd;
let armyFlolder = cwd;
if (process.env['NODE_ENV'] === 'development') {
	armyFlolder = join(cwd, 'data/army');
	saveFolder = join(cwd, 'data/keywords');
} else {
	armyFlolder = join(cwd, 'resources/army');
	saveFolder = join(cwd, 'resources/keywords');
}

const DocTip = memo(() =>
	<div>
		<div>文档类：txt，doc，docx</div>
		<div>压缩包：rar，zip，tar，gz</div>
	</div>
);

/**
 * 涉案词设置
 */
const Word: FC<Prop> = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [isDefault, setIsDefault] = useState<boolean>(true);//开启默认模版
	const [isOpen, setIsOpen] = useState<boolean>(false); //开启验证
	const [isDocVerify, setIsDocVerify] = useState<boolean>(false); //开启文档验证
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [addCategoryModalVisible, setAddCategoryModalVisible] = useState<boolean>(false);
	const [fileList, setFileList] = useState<string[]>([]);

	useMount(() => {
		setIsDefault(localStorage.getItem(LocalStoreKey.UseDefaultTemp) === '1');
		setIsOpen(localStorage.getItem(LocalStoreKey.UseKeyword) === '1');
		setIsDocVerify(localStorage.getItem(LocalStoreKey.UseDocVerify) === '1');
	});

	useMount(async () => {
		let exist = await helper.existFile(saveFolder);
		if (!exist) {
			mkdir(saveFolder, (err) => {
				if (!err) {
					loadFileList();
				}
			});
		} else {
			loadFileList();
		}
	});

	/**
	 * 选择excel文件
	 */
	const selectFileHandle = debounce(
		(defaultPath?: string) => {
			ipcRenderer
				.invoke('open-dialog', {
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

	/**
	 * 打开文件
	 */
	const openFileHandle = debounce(
		(file: string) => {
			let openPath = join(saveFolder, file);
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
				let rmPath = join(saveFolder, file);
				unlink(rmPath, (err) => {
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
	 * 从army目录中拷贝模版文件并重命名
	 * @param newName 新名称（用户输入的分类名）
	 */
	const renameTemplate = async (newName: string) => {

		try {

			await helper.copyFiles(join(armyFlolder, 'template.xlsx'), saveFolder, {
				rename: () => `${newName}.xlsx`
			})
		} catch (error) {
			throw error;
		}
	};

	/**
	 * 读取关键词文件列表
	 * @returns {string[]} 返回目录下所有的文件
	 */
	const readKeywordsList = async () => {
		try {
			const files = await readdir(saveFolder, { encoding: 'utf8' });
			return files;
		} catch (error) {
			throw error;
		}
	};

	/**
	 * 读取文件列表
	 */
	const loadFileList = async () => {
		try {
			const data = await readKeywordsList();
			const next = data.filter((i) => !/.+\$.+/.test(join(saveFolder, i)));
			setFileList(next);
		} catch (error) {
			setFileList([]);
		}
	};

	/**
	 * 写excel文档
	 */
	// const writeExcel = (to: string, data: any[] = ['关键词', '浏览器内容', '聊天内容', '短信内容', '安装app']) => {

	// 	const chunk = xlsx.build([{
	// 		data: [data],
	// 		options: {},
	// 		name: '关键词',
	// 	}]);

	// 	return writeFile(join(to), chunk);
	// };

	/**
	 * 保存分类excel
	 * @param name 分类名称
	 */
	const saveCategoryHandle = async (name: string) => {
		setLoading(true);
		try {
			const list = await readKeywordsList();
			const exist = list.some(item => item === `${name}.xlsx`);
			message.destroy();
			if (exist) {
				message.warn(`「${name}」分类已存在`);
			} else {
				// await writeExcel(join(saveFolder, `${name}.xlsx`));
				await renameTemplate(name);
				await loadFileList();
				shell.openPath(join(saveFolder, `${name}.xlsx`));
				message.success('分类保存成功，请在Excel文档中添加关键词');
				setAddCategoryModalVisible(false);
			}
		} catch (error) {
			console.warn(error);
		} finally {
			setLoading(false);
		}
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
								icon="edit">
								编辑
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

		localStorage.setItem(LocalStoreKey.UseDefaultTemp, isDefault ? '1' : '0');
		localStorage.setItem(LocalStoreKey.UseKeyword, isOpen ? '1' : '0');
		localStorage.setItem(LocalStoreKey.UseDocVerify, isDocVerify ? '1' : '0');
		setIsDirty(false);
		message.destroy();
		message.success('保存成功');
	};

	return (
		<div className="word-root">
			<div className="button-bar">
				<div className="split">
					<div>
						<label>使用默认模版：</label>
						<Switch
							checked={isDefault}
							onChange={() => {
								setIsDefault((prev) => !prev);
								setIsDirty(true);
							}}
							checkedChildren="开"
							unCheckedChildren="关"
						/>
					</div>
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
					</div>
					<div>
						<Tooltip placement="topLeft" title={<DocTip />}>
							<label>开启文档验证：</label>
							<Switch
								checked={isDocVerify}
								onChange={() => {
									setIsDocVerify((prev) => !prev);
									setIsDirty(true);
								}}
								checkedChildren="开"
								unCheckedChildren="关"
							/>
						</Tooltip>
					</div>
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
						<Button onClick={() => setAddCategoryModalVisible(true)} type="primary" icon="plus-circle">
							新建关键词类型
						</Button>
						<Button onClick={() => selectFileHandle(cwd)} type="primary" icon="import">
							导入关键词
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
			<AddCategoryModal
				visible={addCategoryModalVisible}
				loading={loading}
				saveHandle={saveCategoryHandle}
				cancelHandle={() => setAddCategoryModalVisible(false)} />
		</div>
	);
};

export default Word;
