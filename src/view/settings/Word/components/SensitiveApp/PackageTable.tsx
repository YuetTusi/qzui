import React, { FC } from 'react';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import Modal from 'antd/lib/modal';
import { PackageData } from '../PackageModal/PackageModal';
import { SortData } from '../SortModal/SortModal';

interface Prop {
	/**
	 * 分类
	 */
	sort: SortData;
	/**
	 * 数据
	 */
	data: PackageData[];
	/**
	 * 编辑handle
	 */
	editHandle: (arg0: SortData, arg1: PackageData) => void;
	/**
	 * 删除handle
	 */
	delHandle: (arg0: SortData, arg1: PackageData) => void;
}

/**
 * App包名表
 */
const PackageTable: FC<Prop> = (props) => {
	return (
		<Table
			columns={[
				{
					title: 'App',
					dataIndex: 'app',
					key: 'app'
				},
				{
					title: '包名',
					dataIndex: 'package',
					key: 'package'
				},
				{
					title: '编辑',
					dataIndex: 'package',
					key: 'edit',
					width: 80,
					align: 'center',
					render(val: string, record) {
						return <a onClick={() => props.editHandle(props.sort, record)}>编辑</a>;
					}
				},
				{
					title: '删除',
					dataIndex: 'package',
					key: 'del',
					width: 80,
					align: 'center',
					render(val: string, record) {
						return (
							<a
								onClick={() => {
									Modal.confirm({
										onOk() {
											props.delHandle(props.sort, record);
										},
										title: '删除',
										content: `确认删除「${record.app}」？`,
										okText: '是',
										cancelText: '否'
									});
								}}>
								删除
							</a>
						);
					}
				}
			]}
			dataSource={props.data}
			locale={{
				emptyText: <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			}}
			size="small"
			bordered={true}
		/>
	);
};

export default PackageTable;
