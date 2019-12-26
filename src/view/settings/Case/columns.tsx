import { Modal } from "antd";
import React from "react";
import { Dispatch } from "redux";
import CCaseInfo from "@src/schema/CCaseInfo";
import { ColumnProps } from "antd/lib/table";

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>): Array<ColumnProps<CCaseInfo>> {

    const columns = [
        {
            title: '案件名称', dataIndex: 'm_strCaseName', key: 'm_strCaseName', render: (cell: string) => {
                let pos = cell.lastIndexOf('\\');
                return cell.substring(pos + 1);
            }
        },
        {
            title: '自动解析', dataIndex: 'm_bIsAutoParse', key: 'm_bIsAutoParse', width: '100px',
            render: (val: number) => val ? '是' : '否'
        },
        {
            title: '生成BCP', dataIndex: 'm_bIsBCP', key: 'm_bIsBCP', width: '100px',
            render: (val: number) => val ? '是' : '否'
        },
        {
            title: '删除', key: 'del', width: '100px', render: (cell: any, record: CCaseInfo) => {
                let pos = record.m_strCaseName.lastIndexOf('\\');
                let end = record.m_strCaseName.lastIndexOf('_');
                let caseName = record.m_strCaseName.substring(pos + 1, end);
                return <a onClick={() => {
                    Modal.confirm({
                        title: '删除',
                        content: `确认删除「${caseName}」？`,
                        okText: '是',
                        cancelText: '否',
                        onOk() {
                            dispatch({ type: 'case/setLoading', payload: true });
                            dispatch({ type: 'case/deleteCaseData', payload: record.m_strCaseName });
                        }
                    });
                }}>删除</a>;
            }
        },
    ];
    return columns;
}