import React from 'react';
import { Dispatch } from 'redux';
import { UIRetOneParseLogInfo } from '@src/schema/UIRetOneParseLogInfo';
import { ColumnProps } from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import moment from 'moment';

const getColumns = (dispatch: Dispatch<any>): ColumnProps<UIRetOneParseLogInfo>[] => {
    return [{
        title: '案件名称',
        dataIndex: 'strCase_',
        key: 'strCase_',
        render(val: string, record: UIRetOneParseLogInfo) {
            let caseName = val.split('_')[0];
            return <span>{caseName}</span>;
        }
    }, {
        title: '手机名称',
        dataIndex: 'strPhone_',
        key: 'strPhone_',
        render(val: string, record: UIRetOneParseLogInfo) {
            let caseName = val.split('_')[0];
            return <span>{caseName}</span>;
        }
    }, {
        title: '解析开始时间',
        dataIndex: 'llParseStart_',
        key: 'llParseStart_',
        width: 160,
        align: 'center',
        sorter(a, b) {
            let isAfter = moment(a.llParseStart_).isAfter(moment(b.llParseStart_))
            return isAfter ? 1 : -1;
        }
    }, {
        title: '解析完成时间',
        dataIndex: 'llParseEnd_',
        key: 'llParseEnd_',
        width: 160,
        align: 'center',
        sorter(a, b) {
            let isAfter = moment(a.llParseEnd_).isAfter(moment(b.llParseEnd_))
            return isAfter ? 1 : -1;
        }
    }, {
        title: '解析状态',
        dataIndex: 'isParseOk_',
        key: 'isParseOk_',
        width: 100,
        align: 'center',
        render(val: boolean, record: UIRetOneParseLogInfo) {
            if (val) {
                return <Tag color="green" style={{ 'marginRight': 0 }}>成功</Tag>
            } else {
                return <Tag color="red" style={{ 'marginRight': 0 }}>失败</Tag>
            }
        }
    }, {
        title: '创建报告开始时间',
        dataIndex: 'llReportStart_',
        key: 'llReportStart_',
        width: 160,
        align: 'center',
        sorter(a, b) {
            let isAfter = moment(a.llReportStart_).isAfter(moment(b.llReportStart_))
            return isAfter ? 1 : -1;
        }
    }, {
        title: '创建报告结束时间',
        dataIndex: 'llReportEnd_',
        key: 'llReportEnd_',
        width: 160,
        align: 'center',
        sorter(a, b) {
            let isAfter = moment(a.llReportEnd_).isAfter(moment(b.llReportEnd_))
            return isAfter ? 1 : -1;
        }
    }];
}

export { getColumns };