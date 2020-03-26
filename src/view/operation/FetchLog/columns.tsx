import React from 'react';
import { Dispatch } from 'redux';
import { ColumnProps } from 'antd/lib/table';
import CFetchLog from '@src/schema/CFetchLog';
import { helper } from '@src/utils/helper';


/**
 * 表头定义
 * @param dispatch 派发方法
 */
function getColumns(dispatch: Dispatch<any>): ColumnProps<CFetchLog>[] {

    const columns: ColumnProps<any>[] = [
        //     {
        //     title: '案件路径',
        //     dataIndex: 'm_strCasePath',
        //     key: 'm_strCasePath',
        //     render(text: string, record: CFetchLog) {
        //         return <span>{text}</span>;
        //     }
        // },
        {
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
            title: '案件操作员',
            dataIndex: 'm_strChecker',
            key: 'm_strChecker'
        }, {
            title: '程序版本',
            dataIndex: 'm_strVersion',
            key: 'm_strVersion',
            width: 100,
            align: 'center'
        }, {
            title: '是否用户取消',
            dataIndex: 'm_strIsCancel',
            key: 'm_strIsCancel',
            width: 120,
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
            align: 'center'
        }, {
            title: '结束时间',
            dataIndex: 'm_strFinishTime',
            key: 'm_strFinishTime',
            width: 150,
            align: 'center'
        }];
    return columns;
}

export { getColumns };