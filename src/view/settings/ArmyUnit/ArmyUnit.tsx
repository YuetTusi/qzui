import path from 'path';
import { ipcRenderer } from 'electron';
import React, { FormEvent, useState, useRef } from 'react';
import classnames from 'classnames';
import message from 'antd/lib/message';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Table, { PaginationConfig } from 'antd/lib/table';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import EditModal from './components/EditModal/EditModal';
import { TableName } from '@src/schema/db/TableName';
import { ArmyUnitEntity } from '@src/schema/socket/ArmyUnitEntity';
import { useMount } from '@src/hooks';
import { withModeButton } from '@src/components/enhance';
import { getColumns } from './columns';
import { Prop } from './componentTypes';
import './ArmyUnit.less';

const appRootPath = process.cwd();
const defaultPageSize = 10;
const config = helper.readConf();
const { Item } = Form;
const ModeButton = withModeButton()(Button);
let jsonSavePath = ''; //JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	jsonSavePath = path.join(appRootPath, 'data/unit.json');
} else {
	jsonSavePath = path.join(appRootPath, 'resources/data/unit.json');
}

/**
 * 单位管理（自定义版本）
 */
const ArmyUnit = Form.create({ name: 'searchForm' })(({ form }: Prop) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>(0);
	const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
	const [data, setData] = useState<ArmyUnitEntity[]>([]);
	const [currentUnitName, setCurrentUnitName] = useState<string | null>(null);
	const unitName = useRef<string | null>(null);
	const unitId = useRef<string | null>(null);

	const [selectedRowKeys, setSelectedRowKeys] = useState<string[] | number[] | undefined>([]);

	useMount(() => {
		queryArmyUnit(null);
		setCurrentUnitName(localStorage.getItem(LocalStoreKey.UnitName));
	});

	/**
	 * 查询Submit
	 */
	const searchSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const { getFieldValue } = form;
		const unitName = getFieldValue('unitName');

		queryArmyUnit(unitName, 1, defaultPageSize);
	};

	/**
	 * 查询单位数据
	 * @param condition 查询条件
	 */
	const queryArmyUnit = async (
		condition: Record<string, any> | null,
		pageIndex: number = 1,
		pageSize: number = defaultPageSize
	) => {
		setLoading(true);
		try {
			if (helper.isNullOrUndefined(condition)) {
				const [nextData, resultCount] = await Promise.all([
					ipcRenderer.invoke(
						'db-find-by-page',
						TableName.ArmyUnit,
						condition,
						pageIndex,
						pageSize,
						'createdAt',
						-1
					),
					ipcRenderer.invoke('db-count', TableName.ArmyUnit, condition)
				]);
				setData(nextData);
				setTotal(resultCount);
			} else {
				const [nextData, resultCount] = await Promise.all([
					ipcRenderer.invoke(
						'db-find-by-page',
						TableName.ArmyUnit,
						{ unitName: { $regex: new RegExp(`${condition}`) } },
						pageIndex,
						pageSize,
						'createdAt',
						-1
					),
					ipcRenderer.invoke('db-count', TableName.ArmyUnit, {
						unitName: { $regex: new RegExp(`${condition}`) }
					})
					// db.findByPage(
					// 	{ unitName: { $regex: new RegExp(`${condition}`) } },
					// 	pageIndex,
					// 	pageSize,
					// 	'createdAt',
					// 	-1
					// ),
					// db.count({ unitName: { $regex: new RegExp(`${condition}`) } })
				]);
				setData(nextData);
				setTotal(resultCount);
			}
		} catch (error) {
			message.error('查询数据失败');
			log.error(`查询采集单位失败 @view/settings/ArmyUnit: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * 写入JSON文件
	 * @param unitName 采集单位名称
	 * @param unitCode 采集单位编号
	 */
	const writeJson = (unitName: string | null, unitCode: string | null) => {
		let dstUnitCode = localStorage.getItem(LocalStoreKey.DstUnitCode);
		let dstUnitName = localStorage.getItem(LocalStoreKey.DstUnitName);
		helper
			.writeJSONfile(jsonSavePath, {
				customUnit: config.useBcp ? 0 : 1, //非BCP版本将自定义单位置为1
				unitName,
				unitCode,
				dstUnitName,
				dstUnitCode
			})
			.catch((err) => {
				log.error(`写入JSON文件失败 @view/settings/Unit: ${err.message}`);
			});
	};

	/**
	 * 渲染查询表单
	 */
	const renderSearchForm = () => {
		const { getFieldDecorator } = form;
		return (
			<Form layout="inline" onSubmit={searchSubmit}>
				<Item label="单位名称">{getFieldDecorator('unitName')(<Input />)}</Item>
				<Item>
					<ModeButton type="primary" htmlType="submit">
						<Icon type="search" />
						<span>查询</span>
					</ModeButton>
				</Item>
				<Item>
					<ModeButton
						type="primary"
						icon="check-circle"
						onClick={() => {
							if (selectedRowKeys?.length === 0) {
								message.info('请选择单位');
							} else {
								localStorage.setItem(LocalStoreKey.UnitName, unitName.current!);
								localStorage.setItem(LocalStoreKey.UnitCode, unitId.current!);
								setCurrentUnitName(unitName.current);
								writeJson(unitName.current, unitId.current);
								message.success('保存成功');
							}
						}}>
						保存
					</ModeButton>
				</Item>
				<Item>
					<ModeButton
						type="default"
						icon="plus-circle"
						onClick={() => setEditModalVisible(true)}>
						添加
					</ModeButton>
				</Item>
			</Form>
		);
	};

	const saveHandle = async (data: ArmyUnitEntity) => {
		const { setFieldsValue } = form;
		try {
			setFieldsValue({ unitName: undefined });
			await ipcRenderer.invoke('db-insert', TableName.ArmyUnit, data);
			message.success('添加成功');
			setCurrent(1);
			queryArmyUnit(null, 1, defaultPageSize);
			setEditModalVisible(false);
		} catch (error) {
			log.error(`录入采集单位失败 @view/settings/ArmyUnit/saveHandle: ${error.message}`);
		}
	};

	/**
	 * 删除id的单位记录
	 * @param id NeDB_id
	 */
	const delHandle = async (id: string) => {
		const { setFieldsValue } = form;
		try {
			await ipcRenderer.invoke('db-remove', TableName.ArmyUnit, { _id: id });
			message.success('删除成功');
			setFieldsValue({ unitName: undefined });
			setCurrent(1);
			queryArmyUnit(null, 1, defaultPageSize);
		} catch (error) {
			log.error(`删除采集单位失败 @view/settings/ArmyUnit/delHandle: ${error.message}`);
		}
	};

	/**
	 * 编辑框关闭handle
	 * @param {boolean} success 是否保存成功
	 */
	const closeEditModalHandle = () => {
		const { setFieldsValue } = form;
		setEditModalVisible(false);
		setFieldsValue({ unitName: undefined });
		queryArmyUnit(null, 1, defaultPageSize);
	};

	const rowSelectChange = (
		selectedRowKeys: string[] | number[],
		selectedRows: ArmyUnitEntity[]
	) => {
		unitName.current = selectedRows[0].unitName;
		unitId.current = selectedRows[0]._id!;
		setSelectedRowKeys(selectedRowKeys);
	};

	/**
	 * 渲染表格
	 */
	const renderUnitTable = (): JSX.Element => {
		const pagination: PaginationConfig = {
			current,
			pageSize: defaultPageSize,
			total,
			onChange: (pageIndex: number) => {
				setCurrent(pageIndex);
				const { getFieldValue } = form;
				const unitName = getFieldValue('unitName');
				queryArmyUnit(unitName, pageIndex, defaultPageSize);
			}
		};

		return (
			<Table<ArmyUnitEntity>
				columns={getColumns(delHandle)}
				dataSource={data}
				pagination={pagination}
				bordered={true}
				size="default"
				rowKey={(record) => record.unitName}
				rowSelection={{
					type: 'radio',
					onChange: rowSelectChange,
					selectedRowKeys
				}}
				loading={loading}
				locale={{ emptyText: <Empty description="暂无数据" /> }}></Table>
		);
	};

	return (
		<div className="army-unit-root">
			<div className="table-panel">
				<div className="condition-bar">
					<div className="info-bar">
						<label>当前单位：</label>
						<em className={classnames({ pad: config.max <= 2 })}>
							{currentUnitName ?? ''}
						</em>
					</div>
					{renderSearchForm()}
				</div>
				<div className="scroll-panel">{renderUnitTable()}</div>
			</div>
			<div className="fix-buttons"></div>
			<EditModal
				visible={editModalVisible}
				saveHandle={saveHandle}
				closeHandle={closeEditModalHandle}
			/>
		</div>
	);
});

export default ArmyUnit;
