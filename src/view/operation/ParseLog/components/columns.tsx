import { Dispatch } from 'redux';
import { UIParseOneAppinfo } from '@src/schema/UIRetOneParseLogInfo';
import { ColumnProps } from 'antd/lib/table';

const getColumns = (dispatch: Dispatch<any>): ColumnProps<UIParseOneAppinfo>[] => {
    return [{
        title: '应用',
        dataIndex: 'strAppName',
        key: 'strAppName'
    }, {
        title: '解析数量',
        dataIndex: 'count_',
        key: 'count_',
        width: 200
    }];
}

export { getColumns };