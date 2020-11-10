import { remote } from 'electron';
import React, { FC, useState } from 'react';
import moment from 'moment';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import { useMount } from '@src/hooks';
import { helper } from '@utils/helper';
// import Db from '@utils/db';
import { Prop } from './componentTyps';
import { getColumns } from './columns';
import DeviceType from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { DbInstance } from '@src/type/model';
import './InnerPhoneTable.less';

const Db = remote.getGlobal('Db');

const InnerPhoneTable: FC<Prop> = (props) => {
	const db: DbInstance<DeviceType> = new Db(TableName.Device);

	const [data, setData] = useState<DeviceType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useMount(async () => {
		setLoading(true);
		let deviceData = await db.find({ caseId: props.caseId });
		setData(
			deviceData.sort((m: DeviceType, n: DeviceType) =>
				moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1
			)
		);
		setLoading(false);
	});

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
				rowClassName={(record: DeviceType, index: number) =>
					index % 2 === 0 ? 'even-row' : 'odd-row'
				}
				rowKey={(record: DeviceType) => helper.getKey()}></Table>
		</div>
	);
};

export default InnerPhoneTable;
