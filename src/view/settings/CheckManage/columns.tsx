import React, { MouseEvent } from 'react';
import { Dispatch } from 'redux';
import moment from 'moment';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { FetchData } from '@src/schema/socket/FetchData';

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>): ColumnGroupProps[] {
    const columns = [
        {
            title: '序列号',
            dataIndex: 'serial',
            key: 'serial'
        },
        // {
        //     title: '案件名称',
        //     dataIndex: 'caseName',
        //     key: 'caseName',
        //     render(val: string) {
        //         const [caseName] = val.split('_');
        //         return <span>{caseName}</span>;
        //     }
        // },
        {
            title: '手机名称',
            dataIndex: 'mobileName',
            key: 'mobileName',
            render(val: string) {
                const [caseName] = val.split('_');
                return <span>{caseName}</span>;
            }
        },
        {
            title: '姓名',
            dataIndex: 'mobileHolder',
            key: 'mobileHolder'
        },
        {
            title: '身份证/军官证号',
            dataIndex: 'credential',
            key: 'credential'
        },
        {
            title: '设备手机号',
            dataIndex: 'note',
            key: 'note'
        },
        {
            title: '手机编号',
            dataIndex: 'mobileNo',
            key: 'mobileNo'
        },
        {
            title: '编辑',
            dataIndex: 'serial',
            key: 'serial',
            width: '60px',
            align: 'center',
            render: (val: string, record: FetchData) => {
                return (
                    <a
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                            e.stopPropagation();
                            dispatch({ type: 'checkManage/queryDataBySerial', payload: val });
                        }}
                    >
                        编辑
                    </a>
                );
            }
        },
        {
            title: '删除',
            key: 'serial',
            width: '60px',
            align: 'center',
            render: (val: string, record: FetchData) => {
                return (
                    <a
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            Modal.confirm({
                                title: '删除',
                                content: `删除序列号为「${record.serial}」的数据？`,
                                okText: '是',
                                cancelText: '否',
                                onOk() {
                                    dispatch({
                                        type: 'checkManage/delCheckData',
                                        payload: record
                                    });
                                }
                            });
                        }}
                    >
                        删除
                    </a>
                );
            }
        }
    ];
    return columns;
}
