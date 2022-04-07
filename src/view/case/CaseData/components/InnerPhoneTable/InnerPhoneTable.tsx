import { ipcRenderer } from 'electron';
import React, { FC, useEffect, useState } from 'react';
import moment from 'moment';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import DeviceType from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { getColumns } from './columns';
import { Prop } from './componentTyps';
import './InnerPhoneTable.less';

const InnerPhoneTable: FC<Prop> = (props) => {

	const [data, setData] = useState<DeviceType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		(async function () {
			setLoading(true);
			let deviceData = await ipcRenderer.invoke('db-find', TableName.Device, {
				caseId: props.caseId
			});
			setData(
				deviceData.sort((m: DeviceType, n: DeviceType) =>
					moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1
				)
			);
			setLoading(false);
		})();
	}, [props]);

	return (
		<div className="case-inner-table">
			<Table<DeviceType>
				columns={getColumns(props, setData, setLoading)}
				dataSource={data}
				loading={loading}
				pagination={{
					pageSize: 10,
					total: data ? data.length : 0
				}}
				size="middle"
				locale={{
					emptyText: (
						<Empty description="无取证数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)
				}}
				rowKey={(record: DeviceType) => record.id!}></Table>
		</div>
	);
};

export default InnerPhoneTable;
