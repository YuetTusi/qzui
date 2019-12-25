import React from 'react';
import { Dispatch } from 'redux';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import Tag from 'antd/lib/tag';
import Button from 'antd/lib/button';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns(props: any): ColumnGroupProps[] {

    const { parsingHandle, detailHandle } = props;

    const columns = [{
        title: '手机名称',
        dataIndex: 'strPhone_',
        key: 'strPhone_'
    }, {
        title: '解 析', dataIndex: 'status', key: 'status', width: '80px', align: 'center',
        render: (val: any, record: UIRetOneInfo) => {
            if (record.status_ === 1) {
                return <Button type="link" onClick={() => parsingHandle(record)} disabled={true}>解析</Button>;
            } else {
                return <Button type="link" onClick={() => parsingHandle(record)}>解析</Button>;
            }
        }
    }, {
        title: '详 情',
        dataIndex: 'detail',
        key: 'detail',
        width: '80px',
        align: 'center',
        render(val: any, record: UIRetOneInfo) {
            return <Button type="link" onClick={() => detailHandle(record)}>详情</Button>
        }
    }];
    return columns;
}