import React from 'react';
import { Dispatch } from 'redux';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';

/**
 * 表头定义
 */
export function getColumns<T>(dispatch: Dispatch<T>): ColumnGroupProps[] {
    let columns = [
        {
            title: '检验单位',
            dataIndex: 'm_strCheckOrganizationName',
            key: 'm_strCheckOrganizationName',
            render(val: string) {
                return <span>{val.trim()}</span>;
            }
        },
        {
            title: '单位编号',
            dataIndex: 'm_strCheckOrganizationID',
            key: 'm_strCheckOrganizationID',
            width: 140,
            align: 'center'
        }
    ];
    return columns;
}