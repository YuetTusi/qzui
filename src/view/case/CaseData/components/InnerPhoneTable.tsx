import React, { FC, useEffect } from 'react';
import { connect } from 'dva';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import { helper } from '@utils/helper';
import { Prop } from './componentTyps';
import { getColumns } from './columns';
import './InnerPhoneTable.less';
import DeviceType from '@src/schema/socket/DeviceType';

const InnerPhoneTable: FC<Prop> = (props) => {

    const { loading } = props.innerPhoneTable;

    useEffect(() => console.log(props.data), []);

    return <div className="case-inner-table">
        <Table<DeviceType>
            columns={getColumns(props)}
            dataSource={props.data}
            loading={loading}
            pagination={false}
            size="middle"
            locale={{ emptyText: <Empty description="无取证数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            rowClassName={(record: DeviceType, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            rowKey={(record: DeviceType) => helper.getKey()}>
        </Table>
    </div>;
};

export default connect((state: any) => ({ innerPhoneTable: state.innerPhoneTable }))(InnerPhoneTable);