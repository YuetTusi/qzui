import React, { PropsWithChildren } from 'react';
import Table from 'antd/lib/table';
import { getColumns } from './column';
import './InnerPhoneList.less';

interface IProp {
    data: any;
}

/**
 * 案件下手机列表
 */
function InnerPhoneList(props: PropsWithChildren<IProp>): JSX.Element {
    return <div className="inner-phone-list">
        <Table
            columns={getColumns(props.data)}
            dataSource={props.data}
            pagination={false}
            size="middle" />
    </div>;
}

export default InnerPhoneList;