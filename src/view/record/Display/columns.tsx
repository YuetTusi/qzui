import React from "react";
import { IDispatchFunc } from "@src/type/model";
import { routerRedux } from "dva/router";
import CCaseInfo from "@src/schema/CCaseInfo";

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns(dispatch: IDispatchFunc) {

    const columns = [
        {
            title: '案件名称',
            dataIndex: 'm_strCaseName',
            key: 'm_strCaseName',
            render: (cell: string) => {
                let pos = cell.lastIndexOf('\\');
                return <a
                    onClick={() =>
                        dispatch(routerRedux.push('/record/phone-list'))
                    }>
                    {cell.substring(pos + 1)}
                </a>;
            }
        },
        {
            title: '自动解析', dataIndex: 'm_bIsAutoParse', key: 'm_bIsAutoParse', width: '100px',
            render: (val: number) => val ? '是' : '否'
        },
        {
            title: '生成BCP', dataIndex: 'm_bIsBCP', key: 'm_bIsBCP', width: '100px',
            render: (val: number) => val ? '是' : '否'
        }
    ];
    return columns;
}