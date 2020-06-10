import React from 'react';
import { Dispatch } from 'redux';
import { UIParseOneAppinfo } from '@src/schema/UIRetOneParseLogInfo';
import { ColumnProps } from 'antd/lib/table';
import Tag from 'antd/lib/tag';

const getColumns = (dispatch: Dispatch<any>): ColumnProps<UIParseOneAppinfo>[] => {
    return [{
        title: '应用',
        dataIndex: 'strAppName',
        key: 'strAppName',
        width: 260
    }, {
        title: '状态',
        dataIndex: 'isparseok_',
        key: 'isparseok_',
        width: 70,
        align: 'center',
        render(val: boolean) {
            if (val) {
                return <Tag color="green" style={{ 'marginRight': 0 }}>成功</Tag>
            } else {
                return <Tag color="red" style={{ 'marginRight': 0 }}>失败</Tag>
            }
        }
    }, {
        title: '解析数量',
        dataIndex: 'count_',
        key: 'count_',
        width: 150
    }, {
        title: '描述信息',
        dataIndex: 'strdec',
        key: 'strdec'
    }];
}

export { getColumns };