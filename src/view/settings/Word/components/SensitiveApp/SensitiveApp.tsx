import path from 'path';
import { OpenDialogReturnValue, remote } from 'electron';
import React, { FC, useState, useRef } from 'react';
import uuid from 'uuid/v4';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Input from 'antd/lib/input';
import Table from 'antd/lib/table';
import message from 'antd/lib/message';
import { helper } from '@src/utils/helper';
import { useMount } from '@src/hooks';
import SortModal, { SortData } from '../SortModal/SortModal';
import PackageModal, { PackageData } from '../PackageModal/PackageModal';
import PackageTable from './PackageTable';
import { Prop } from './componentTyps';
import { getColumns } from './columns';
import './SensitiveApp.less';

const appRootPath = process.cwd();
let jsonSavePath = appRootPath;
if (process.env['NODE_ENV'] === 'development') {
	jsonSavePath = path.join(appRootPath, 'data/apps.json');
} else {
	jsonSavePath = path.join(appRootPath, 'resources/data/apps.json');
}

/**
 * legacy: 兼容代码，保证children子项都有id
 * @param data
 */
const addIdToChild = (data: SortData[]) => {
	return data.map((item) => {
		if (item.children && item.children.length > 0) {
			item.children = item.children.map((child) => {
				if (helper.isNullOrUndefined(child?.id)) {
					child.id = uuid();
				}
				return child;
			});
			return item;
		} else {
			return item;
		}
	});
};

/**
 * 敏感应用配置
 */
const SensitiveApp: FC<Prop> = (props) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<SortData<PackageData>[]>([]);
	const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
	const [packageModalVisible, setPackageModalVisible] = useState<boolean>(false);
	const currentSort = useRef<SortData>();
	const currentPackage = useRef<PackageData>();
	const inputRef = useRef<Input>(null);

	/**
	 * 读取JSON文件
	 */
	const loadFile = async () => {
		setLoading(true);
		try {
			let next: SortData[] = await helper.readJSONFile(jsonSavePath);
			setData(next);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * 可读流方式读取JSON文件
	 * @param filePath 文件路径
	 */
	// const readFile = (filePath: string): Promise<any> => {
	// 	let str = '';
	// 	return new Promise((resolve, reject) => {
	// 		const rs = fs.createReadStream(filePath, { encoding: 'utf8' });
	// 		rs.on('data', (chunk) => {
	// 			str += chunk;
	// 		});
	// 		rs.on('end', () => {
	// 			resolve(JSON.parse(str));
	// 		});
	// 		rs.on('error', (e) => reject(e));
	// 	});
	// };

	useMount(async () => {
		setLoading(true);
		try {
			let next: SortData[] = await helper.readJSONFile(jsonSavePath);
			let hasIdData = addIdToChild(next);
			await helper.writeJSONfile(jsonSavePath, hasIdData);
			setData(hasIdData);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	});

	// useMount(loadFile);

	/**
	 * 添加分类
	 */
	const addSortHandle = () => {
		currentSort.current = undefined;
		setSortModalVisible(true);
	};

	/**
	 * 添加分类下的包名
	 */
	const addPackageHandle = (sort: SortData) => {
		currentSort.current = sort;
		setPackageModalVisible(true);
	};

	/**
	 * 保存分类handle
	 * @param sort 分类
	 */
	const saveSortHandle = async (sort: SortData<PackageData>) => {
		let next = data;
		if (helper.isNullOrUndefined(sort.id)) {
			//*添加
			next = data.concat([
				{
					...sort,
					id: uuid()
				}
			]);
		} else {
			//*编辑
			next = data.map((item) => {
				if (item.id === sort.id) {
					return sort;
				} else {
					return item;
				}
			});
		}
		try {
			await helper.writeJSONfile(jsonSavePath, next);
			await loadFile();
			message.success('保存成功');
			setSortModalVisible(false);
		} catch (error) {
			message.error('保存失败');
		}
	};

	/**
	 * 保存分类下的App
	 * @param sort 父分类
	 * @param pkg 包数据
	 */
	const savePackageHandle = async (sort: SortData<PackageData>, pkg: PackageData) => {
		let next: SortData<PackageData>[] = [];
		if (helper.isNullOrUndefined(pkg.id)) {
			//*添加
			for (let i = 0; i < data.length; i++) {
				if (data[i].id === sort.id) {
					data[i].children.push({
						...pkg,
						id: uuid()
					});
				}
			}
			next = data;
		} else {
			//*编辑
			for (let i = 0; i < data.length; i++) {
				if (data[i].id === sort.id) {
					data[i].children = data[i].children.map((item) => {
						if (item.id === pkg.id) {
							return pkg;
						} else {
							return item;
						}
					});
					break;
				}
			}
			next = data;
		}
		try {
			await helper.writeJSONfile(jsonSavePath, next);
			await loadFile();
			message.success('保存成功');
			currentPackage.current = undefined;
			currentSort.current = undefined;
			setPackageModalVisible(false);
		} catch (error) {
			message.error('保存失败');
		}
	};

	/**
	 * 编辑分类handle
	 * @param sort 分类数据
	 */
	const editSortHandle = (sort: SortData) => {
		currentSort.current = sort;
		setSortModalVisible(true);
	};
	/**
	 * 删除分类handle
	 * @param sort
	 */
	const delSortHandle = async (sort: SortData) => {
		const next = data.filter((item) => sort.id !== item.id);
		try {
			await helper.writeJSONfile(jsonSavePath, next);
			await loadFile();
			message.success('删除成功');
			setSortModalVisible(false);
		} catch (error) {
			message.error('删除失败');
		}
	};

	/**
	 * 编辑App handle
	 * @param sort 分类
	 * @param pkg App
	 */
	const editPackageHandle = async (sort: SortData, pkg: PackageData) => {
		currentSort.current = sort;
		currentPackage.current = pkg;
		setPackageModalVisible(true);
	};
	/**
	 * 删除App handle
	 * @param sort 分类
	 * @param pkg App
	 */
	const delPackageHandle = async (sort: SortData, pkg: PackageData) => {
		const next = data.map((item) => {
			if (item.id === sort.id) {
				item.children = item.children.filter((p) => p.id !== pkg.id);
			}
			return item;
		});
		try {
			await helper.writeJSONfile(jsonSavePath, next);
			await loadFile();
			message.success('删除成功');
		} catch (error) {
			message.error('保存失败');
		}
	};

	/**
	 * 查询handle
	 */
	const searchHandle = () => {
		const { value } = inputRef.current!.input;
		if (helper.isNullOrUndefinedOrEmptyString(value)) {
			loadFile();
		} else {
			const next = data.filter((item) => item.sort.includes(value));
			setData(next);
		}
	};

	/**
	 * 选择案件路径Handle
	 */
	const selectDirHandle = debounce(
		() => {
			remote.dialog
				.showOpenDialog({
					title: '选择数据文件',
					properties: ['openFile'],
					filters: [{ name: 'JSON文件', extensions: ['json'] }]
				})
				.then((val: OpenDialogReturnValue) => {
					if (val.filePaths && val.filePaths.length > 0) {
						//val.filePaths[0]
					}
				});
		},
		500,
		{ leading: true, trailing: false }
	);

	return (
		<div className="sensitive-app-root">
			<div className="btn-bar">
				<div className="left">
					<label>分类：</label>
					<Input ref={inputRef} />
					<Button onClick={searchHandle} type="primary" icon="search">
						查询
					</Button>
				</div>
				<div className="right">
					<Button onClick={() => addSortHandle()} type="default" icon="plus-circle">
						添加分类
					</Button>
					{/* <Button onClick={() => selectDirHandle()} type="default" icon="import">
						导入数据
					</Button> */}
				</div>
			</div>
			<div className="table-panel">
				<Table<SortData<PackageData>>
					dataSource={data}
					columns={getColumns({
						addPackageHandle,
						editSortHandle,
						delSortHandle
					})}
					expandedRowRender={(record) => (
						<div className="inner-table-panel">
							<PackageTable
								sort={record}
								data={record.children}
								editHandle={editPackageHandle}
								delHandle={delPackageHandle}
							/>
						</div>
					)}
					locale={{
						emptyText: (
							<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
						)
					}}
					loading={loading}
					expandRowByClick={true}
					childrenColumnName="packages"
					size="small"
					bordered={true}
				/>
			</div>
			<SortModal
				data={currentSort.current!}
				visible={sortModalVisible}
				saveHandle={saveSortHandle}
				closeHandle={() => {
					currentSort.current = undefined;
					setSortModalVisible(false);
				}}
			/>
			<PackageModal
				visible={packageModalVisible}
				sort={currentSort.current!}
				data={currentPackage.current!}
				saveHandle={savePackageHandle}
				closeHandle={() => {
					currentSort.current = undefined;
					currentPackage.current = undefined;
					setPackageModalVisible(false);
				}}
			/>
		</div>
	);
};

export default SensitiveApp;
