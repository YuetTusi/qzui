import { Modal } from "antd";
import React from "react";
import { Dispatch } from "redux";
import CCaseInfo from "@src/schema/CCaseInfo";
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>): ColumnGroupProps[] {

    const columns = [{
        title: '案件名称', dataIndex: 'caseName', key: 'caseName', render: (cell: string) => {
            let pos = cell.lastIndexOf('\\');
            return cell.substring(pos + 1);
        }
    }, {
        title: '自动解析', dataIndex: 'm_bIsAutoParse', key: 'm_bIsAutoParse', width: '100px', align: 'center',
        render: (val: number) => val ? '是' : '否'
    }, {
        title: '生成BCP', dataIndex: 'm_bIsGenerateBCP', key: 'm_bIsGenerateBCP', width: '100px', align: 'center',
        render: (val: number) => val ? '是' : '否'
    }, {
        title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: '200px', align: 'center'
    }, {
        title: '删除', key: 'del', width: '100px',
        align: 'center',
        render: (cell: any, record: CCaseInfo) => {
            let pos = record.m_strCaseName.lastIndexOf('\\');
            let end = record.m_strCaseName.lastIndexOf('_');
            let caseName = record.m_strCaseName.substring(pos + 1, end);
            return <a onClick={() => {
                Modal.confirm({
                    title: `删除「${caseName}」`,
                    content: `案件下的取证数据将一并删除，确认吗？`,
                    okText: '是',
                    cancelText: '否',
                    onOk() {
                        dispatch({ type: 'caseData/setLoading', payload: true });
                        dispatch({ type: 'caseData/deleteCaseData', payload: record.m_strCaseName });
                    }
                });
            }}>删除</a>;
        }
    }
    ];
    return columns;
}