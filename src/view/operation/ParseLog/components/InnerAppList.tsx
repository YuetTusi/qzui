import React, { FC } from 'react';
import { Dispatch } from 'redux';
import Table from 'antd/lib/table';
import { getColumns } from './columns';
import { UIParseOneAppinfo } from '@src/schema/UIRetOneParseLogInfo';
import './InnerAppList.less';

interface Prop {
    /**
     * 派发方法
     */
    dispatch: Dispatch<any>;
    /**
     * App数据
     */
    data: UIParseOneAppinfo[];
};

/**
 * 解析App列表
 */
const InnerAppList: FC<Prop> = (props) => {
    return <div className="inner-app-list-root">
        <Table<UIParseOneAppinfo>
            dataSource={props.data}
            columns={getColumns(props.dispatch)}
            pagination={false}
            bordered={false}
            size="small" />
    </div>;
};

export default InnerAppList;