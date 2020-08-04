import React, { FC } from 'react';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import { helper } from '@utils/helper';
import { Prop } from './componentTyps';
import { getColumns } from './columns';
import DeviceType from '@src/schema/socket/DeviceType';
import './InnerPhoneTable.less';

const InnerPhoneTable: FC<Prop> = (props) => {

    const { data } = props;
    return <div className="case-inner-table">
        <Table<DeviceType>
            columns={getColumns(props)}
            dataSource={data}
            pagination={{
                pageSize: 10,
                total: data ? data.length : 0
            }}
            size="middle"
            locale={{ emptyText: <Empty description="无取证数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            rowClassName={(record: DeviceType, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            rowKey={(record: DeviceType) => helper.getKey()}>
        </Table>
    </div>;
};

export default InnerPhoneTable;