import { remote } from 'electron';
import React, { FC } from 'react';
import Table from 'antd/lib/table';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import { getColumns } from './column';
import { IProp } from './PropsType';
import './InnerPhoneList.less';

//ReportReader/ReportReader.exe
let publishPath = remote.app.getAppPath();

/**
 * 案件下手机列表
 */
const InnerPhoneList: FC<IProp> = (props) => {

    return <div className="inner-phone-list">
        <Table<UIRetOneInfo>
            columns={getColumns(props, publishPath, props.isRunning)}
            dataSource={props.data}
            pagination={false}
            bordered={true}
            size="middle"
            rowClassName={(record: UIRetOneInfo, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'} />
    </div>;
}

export default InnerPhoneList;