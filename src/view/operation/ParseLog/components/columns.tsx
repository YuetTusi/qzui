import { Dispatch } from 'redux';
import { ParseApp } from '@src/schema/socket/ParseLog';
import { ColumnProps } from 'antd/lib/table';

const getColumns = (dispatch: Dispatch<any>): ColumnProps<ParseApp>[] => {
    return [{
        title: '应用',
        dataIndex: 'appname',
        key: 'appname',
        width: 260
    }, {
        title: '解析数量',
        dataIndex: 'u64count',
        key: 'u64count',
        width: 150
    }];
}

export { getColumns };