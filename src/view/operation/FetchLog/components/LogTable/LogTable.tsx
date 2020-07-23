
import React, { FC, memo } from 'react';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import FetchLogEntity from '@src/schema/socket/FetchLog';
import { getColumns } from './columns';
import { Prop } from './componentType';

/**
 * 表格组件
 */
const LogTable: FC<Prop> = props => {

    const { context, total, current, pageSize, data, loading } = props;

    return <Table<FetchLogEntity>
        columns={getColumns(context)}
        dataSource={data}
        bordered={true}
        loading={loading}
        size="small"
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        rowClassName={(record: FetchLogEntity, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
        pagination={{
            total: total,
            current: current,
            pageSize: pageSize,
            onChange: context.pageChange
        }} />;
};

export default memo(LogTable);