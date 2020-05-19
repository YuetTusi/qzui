import React from 'react';
import moment from 'moment';
import { Dispatch } from 'redux';
import { ColumnProps } from 'antd/lib/table';
import CFetchLog from '@src/schema/CFetchLog';
import { helper } from '@src/utils/helper';

/**
 * 表头定义
 * @param dispatch 派发方法
 */
function getColumns(dispatch: Dispatch<any>, context: any): ColumnProps<CFetchLog>[] {

    const columns: ColumnProps<CFetchLog>[] = [{
        title: '手机名称',
        dataIndex: 'm_strDeviceName',
        key: 'm_strDeviceName',
        render(text: string, record: CFetchLog) {
            if (helper.isNullOrUndefined(text)) {
                return <span className="oneline">{text}</span>;
            } else {
                return <span className="oneline">{text.split('_')[0]}</span>;
            }
        }
    }, {
        title: '采集方式',
        dataIndex: 'm_strFetchType',
        key: 'm_strFetchType'
    }, {
        title: '检验员',
        dataIndex: 'm_strChecker',
        key: 'm_strChecker',
        width: 140,
    }, {
        title: '程序版本',
        dataIndex: 'm_strVersion',
        key: 'm_strVersion',
        width: 90,
        align: 'center'
    }, {
        title: '用户取消',
        dataIndex: 'm_strIsCancel',
        key: 'm_strIsCancel',
        width: 90,
        align: 'center',
        render(text: string, record: CFetchLog) {
            if (helper.isNullOrUndefinedOrEmptyString(text)) {
                return '否';
            } else {
                return '是';
            }
        }
    }, {
        title: '开始时间',
        dataIndex: 'm_strStartTime',
        key: 'm_strStartTime',
        width: 150,
        align: 'center',
        sorter(a, b) {
            let isAfter = moment(a.m_strFinishTime).isAfter(moment(b.m_strFinishTime))
            return isAfter ? 1 : -1;
        }
    }, {
        title: '结束时间',
        dataIndex: 'm_strFinishTime',
        key: 'm_strFinishTime',
        width: 150,
        align: 'center',
        sorter(a, b) {
            let isAfter = moment(a.m_strFinishTime).isAfter(moment(b.m_strFinishTime))
            return isAfter ? 1 : -1;
        }
    }, {
        title: '编辑',
        dataIndex: 'modify',
        key: 'modify',
        width: 60,
        align: 'center',
        render(text: string, record: CFetchLog) {
            return <a onClick={() => {
                context.setState({
                    modifyLogModalVisible: true,
                    editEntity: { ...record }
                });
            }}>编辑</a>;
        }
    }];
    return columns;
}

export { getColumns };