import React from "react";
import Button from 'antd/lib/button';
import { ColumnProps } from "antd/lib/table";
import { IDispatchFunc } from "@src/type/model";
import { routerRedux } from "dva/router";
import CCaseInfo from "@src/schema/CCaseInfo";

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns(dispatch: IDispatchFunc): ColumnProps<CCaseInfo>[] {

    const columns: ColumnProps<CCaseInfo>[] = [{
        title: '案件名称',
        dataIndex: 'm_strCaseName',
        key: 'm_strCaseName',
        render: (cell: string) => {
            let pos = cell.lastIndexOf('\\');
            return <span>{cell.substring(pos + 1)}</span>;
        }
    }, {
        title: '自动解析', dataIndex: 'm_bIsAutoParse', key: 'm_bIsAutoParse', width: '100px',
        render: (val: number) => val ? '是' : '否'
    }, {
        title: '生成BCP', dataIndex: 'm_bIsBCP', key: 'm_bIsBCP', width: '100px',
        render: (val: number) => val ? '是' : '否'
    }, {
        title: '解析', dataIndex: 'm_bIsBCP', key: 'm_bIsBCP', width: '100px', align: 'center',
        render: (val: any, record: CCaseInfo) => {
            if (record.m_bIsAutoParse) {
                return <Button type="link" onClick={() => alert('do it')} disabled={true}>解析</Button>;
            } else {
                return <Button type="link" onClick={() => alert('do it')}>解析</Button>;
            }
        }
    }];
    return columns;
}