import React, { FC } from 'react';
import Table from 'antd/lib/table';
import { helper } from '@src/utils/helper';

interface Prop {
	data: string[];
}

const getDataSource = (data?: string[]) => {
	if (helper.isNullOrUndefined(data)) {
		return [];
	} else {
		return data?.map((item) => ({ value: item }));
	}
};

const InnerTable: FC<Prop> = (props) => {
	const { data } = props;

	return (
		<div className="inner-table-panel">
			<Table
				dataSource={getDataSource(data)}
				columns={[
					{
						title: '关键词',
						dataIndex: 'value',
						key: 'value'
					}
				]}
				bordered={true}
				size="small"
			/>
		</div>
	);
};

export default InnerTable;
