import React, { PropsWithChildren } from 'react';
import { Dispatch } from 'redux';
import Table from 'antd/lib/table';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import { getColumns } from './column';
import './InnerPhoneList.less';

interface IProp {
    data: UIRetOneInfo[];
    dispatch: Dispatch<any>;
    parsingHandle: (arg0: UIRetOneInfo) => void;
    detailHandle: (arg0: UIRetOneInfo) => void;
}

/**
 * 案件下手机列表
 */
function InnerPhoneList(props: PropsWithChildren<IProp>): JSX.Element {
    return <div className="inner-phone-list">
        <Table<UIRetOneInfo>
            columns={getColumns(props)}
            dataSource={props.data}
            pagination={false}
            bordered={true}
            size="middle"
            rowClassName={(record: UIRetOneInfo, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'} />
    </div>;
}

export default InnerPhoneList;