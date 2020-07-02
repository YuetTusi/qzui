import React, { MouseEvent } from "react";
import { routerRedux } from 'dva/router';
import { Modal } from "antd";
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
        render: (val: boolean) => val ? '是' : '否'
    }, {
        title: '生成BCP', dataIndex: 'm_bIsGenerateBCP', key: 'm_bIsGenerateBCP', width: '100px', align: 'center',
        render: (val: boolean) => val ? '是' : '否'
    }, {
        title: '包含附件', dataIndex: 'm_bIsAttachment', key: 'm_bIsAttachment', width: '100px', align: 'center',
        render: (val: boolean) => val ? '是' : '否'
    }, {
        title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: '200px', align: 'center'
    }, {
        title: '编辑', key: 'edit', width: '100px', align: 'center',
        render: (cell: any, record: CCaseInfo) => {
            return <a onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
                dispatch(routerRedux.push(`/case/case-edit/${record._id!}`));
            }}>编辑</a>;
        }
    }, {
        title: '删除', key: 'del', width: '100px',
        align: 'center',
        render: (cell: any, record: CCaseInfo) => {
            let pos = record.m_strCaseName.lastIndexOf('\\');
            let end = record.m_strCaseName.lastIndexOf('_');
            let caseName = record.m_strCaseName.substring(pos + 1, end);
            return <a onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
                Modal.confirm({
                    title: `删除「${caseName}」`,
                    content: `案件下取证数据将一并删除，确认吗？`,
                    okText: '是',
                    cancelText: '否',
                    onOk() {
                        dispatch({ type: 'caseData/setLoading', payload: true });
                        dispatch({ type: 'caseData/deleteCaseData', payload: record._id });
                    }
                });
            }}>删除</a>;
        }
    }
    ];
    return columns;
}