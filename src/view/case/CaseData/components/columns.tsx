import React from 'react';
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import { Prop } from './componentTyps';
import { ExtendMyPhoneInfo } from "@src/model/case/CaseData/InnerPhoneTable";

/**
 * 表头定义
 * @param param0 组件属性
 * @param casePath 案件路径
 */
function getColumns({ delHandle }: Prop, casePath: string): ColumnGroupProps[] {
    const columns = [{
        title: '手机',
        dataIndex: 'phoneName',
        key: 'phoneName'
    }, {
        title: '手机持有人',
        dataIndex: 'm_strDeviceHolder',
        key: 'm_strDeviceHolder',
        width: '150px'
    }, {
        title: '手机编号',
        dataIndex: 'm_strDeviceNumber',
        key: 'm_strDeviceNumber',
        width: '150px'
    }, {
        title: '取证时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: '180px',
        align: 'center'
    }, {
        title: '删除',
        key: 'del',
        width: 100,
        align: 'center',
        render: (record: ExtendMyPhoneInfo) => {
            return <a onClick={() => delHandle(record, casePath)}>删除</a>;
        }
    }];
    return columns;
}

export { getColumns };