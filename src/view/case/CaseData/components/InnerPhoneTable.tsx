import { remote } from 'electron';
import React, { FC, useEffect, useState } from 'react';
import moment from 'moment';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import DeviceType from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { DbInstance } from '@src/type/model';
import { Prop } from './componentTyps';
import { getColumns } from './columns';
import './InnerPhoneTable.less';
import { DataMode } from '@src/schema/DataMode';

const getDb = remote.getGlobal('getDb');

const InnerPhoneTable: FC<Prop> = (props) => {
	const db: DbInstance<DeviceType> = getDb(TableName.Device);

	const [data, setData] = useState<DeviceType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		(async function () {
			setLoading(true);
			let deviceData = await db.find({ caseId: props.caseId });
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
				rowClassName={(record: DeviceType, index: number) => {
					switch (record.mode) {
						case DataMode.ServerCloud:
							return 'cloud-row';
						default:
							return 'default-row';
					}
				}}
				rowKey={(record: DeviceType) => record.id!}></Table>
		</div>
	);
};

export default InnerPhoneTable;
