import { ipcRenderer } from 'electron';
import React, { FC, useEffect, useState } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import DeviceType from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { helper } from '@utils/helper';
import logger from '@utils/log';
import { Prop } from './componentType';
import { getColumns } from './columns';
import { StateTree } from '@src/type/model';
import './InnerPhoneTable.less';

const InnerPhoneTable: FC<Prop> = (props) => {
	const [pageIndex, setPageIndex] = useState(
		helper.isNullOrUndefined(props.pageIndex) ? 1 : props.pageIndex
	);
	const [data, setData] = useState<DeviceType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const { expended, caseData } = props;
		if (expended) {
			//查询数据
			setLoading(true);
			(async function () {
				try {
					let deviceData = (await ipcRenderer.invoke('db-find', TableName.Device, {
						caseId: caseData._id
					})) as DeviceType[];
					setData(
						deviceData.sort((m, n) =>
							moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1
						)
					);
					setLoading(false);
				} catch (error) {
					logger.error(
						`查询手机子表格失败 @view/record/Parse/InnerPhoneTable.tsx: ${error.message}`
					);
					setLoading(false);
				}
			})();
		}
	}, [props.caseData, props.expended]);

	return (
		<div className="case-inner-table">
			<Table<DeviceType>
				columns={getColumns(props, setData, setLoading)}
				dataSource={data}
				loading={loading}
				pagination={{
					current: pageIndex,
					pageSize: 10,
					total: data ? data.length : 0,
					onChange(current: number) {
						props.pageChange(current, props.caseData._id!);
						setPageIndex(current);
					}
				}}
				// scroll={{ x: 'max-content' }} //*若显示横向滚动条，放开注释
				size="middle"
				locale={{
					emptyText: (
						<Empty description="无取证数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)
				}}
				rowKey={(record) => record.id!}></Table>
		</div>
	);
};

export default connect((state: StateTree) => ({ innerPhoneTable: state.innerPhoneTable }))(
	InnerPhoneTable
);
