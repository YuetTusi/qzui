import React, { FC, useEffect, useState } from 'react';
// import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import Db from '@utils/db';
import { Prop } from './componentType';
import { getColumns } from './columns';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import { TableName } from '@src/schema/db/TableName';
import moment from 'moment';
import './InnerPhoneTable.less';

const InnerPhoneTable: FC<Prop> = (props) => {

    const [pageIndex, setPageIndex] = useState(helper.isNullOrUndefined(props.pageIndex) ? 1 : props.pageIndex);
    // const [disableBatchBcp, setDisableBatchBcp] = useState<boolean>(true);
    // const selectDevice = useRef<DeviceType[]>([]);
    const [data, setData] = useState<DeviceType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const db = new Db<DeviceType>(TableName.Device);

    useEffect(() => {
        //查询数据
        (async function () {
            setLoading(true);
            let deviceData = await db.find({ caseId: props.caseId });
            setData(deviceData.sort((m, n) => moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1));
            setLoading(false);
        })();
    }, [props]);

    /**
     * 勾选行Change事件
     * @param selectRowKeys 手机id
     * @param rows 行数据
     */
    // const onChange = (selectRowKeys: string[] | number[], rows: DeviceType[]) => {
    //     setDisableBatchBcp(selectRowKeys.length === 0);
    //     selectDevice.current = rows;
    // };

    /**
     * Checkbox属性设置
     */
    // const getCheckboxProps = (row: DeviceType) => {
    //     return {
    //         disabled: row.parseState === ParseState.Fetching
    //             || row.parseState === ParseState.Parsing
    //             || row.parseState === ParseState.NotParse
    //     };
    // };

    /**
     * 批量生成BCP Click
     */
    // const batchBcpClick = (e: MouseEvent<HTMLButtonElement>) => {
    //     props.batchHandle(selectDevice.current, props.caseId);
    // };

    return <div className="case-inner-table">
        {/* <div className="inner-phone-button-bar">
            <Button
                onClick={batchBcpClick}
                disabled={disableBatchBcp}
                type="primary"
                size="small">
                批量生成BCP
            </Button>
        </div> */}
        <Table<DeviceType>
            columns={getColumns(props, setData, setLoading)}
            dataSource={data}
            loading={loading}
            // rowSelection={{ onChange, getCheckboxProps }}
            pagination={{
                current: pageIndex,
                pageSize: 10,
                total: data ? data.length : 0,
                onChange(current: number, pageSize?: number) {
                    props.pageChange(current, props.caseId);
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