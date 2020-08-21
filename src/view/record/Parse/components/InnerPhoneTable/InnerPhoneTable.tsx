import React, { FC, useEffect, useState } from 'react';
import moment from 'moment';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import Db from '@utils/db';
import { Prop } from './componentType';
import { getColumns } from './columns';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import { TableName } from '@src/schema/db/TableName';
import './InnerPhoneTable.less';

const InnerPhoneTable: FC<Prop> = (props) => {

    const [pageIndex, setPageIndex] = useState(helper.isNullOrUndefined(props.pageIndex) ? 1 : props.pageIndex);
    const [data, setData] = useState<DeviceType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const db = new Db<DeviceType>(TableName.Device);

    useEffect(() => {
        if (props.expended) {
            //查询数据
            (async function () {
                setLoading(true);
                console.log(`查询：${props.caseData._id}`);
                let deviceData = await db.find({ caseId: props.caseData._id });
                setData(deviceData.sort((m, n) => moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1));
                setLoading(false);
            })();
        }
    }, [props.caseData, props.expended]);


    return <div className="case-inner-table">
        <Table<DeviceType>
            columns={getColumns(props, setData, setLoading)}
            dataSource={data}
            loading={loading}
            pagination={{
                current: pageIndex,
                pageSize: 10,
                total: data ? data.length : 0,
                onChange(current: number, pageSize?: number) {
                    props.pageChange(current, props.caseData._id!);
                    setPageIndex(current);
                }
            }}
            size="middle"
            locale={{ emptyText: <Empty description="无取证数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            rowClassName={(record: DeviceType, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            rowKey={record => record.id!}>
        </Table>
    </div>;
};

export default InnerPhoneTable;