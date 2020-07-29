import React from "react";
import moment from 'moment';
import Tag from 'antd/lib/tag';
import { Dispatch } from "redux";
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import DeviceType from "@src/schema/socket/DeviceType";

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>): ColumnGroupProps[] {

    const columns = [{
        title: '案件名称', dataIndex: 'm_strCaseName', key: 'm_strCaseName', render: (cell: string) => {
            return cell.includes('_') ? cell.split('_')[0] : cell;
        }
    }, {
        title: '自动解析', dataIndex: 'm_bIsAutoParse', key: 'm_bIsAutoParse', width: '100px', align: 'center',
        render: (val: boolean) => val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
    }, {
        title: '生成BCP', dataIndex: 'm_bIsGenerateBCP', key: 'm_bIsGenerateBCP', width: '100px', align: 'center',
        render: (val: boolean) => val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
    }, {
        title: '包含附件', dataIndex: 'm_bIsAttachment', key: 'm_bIsAttachment', width: '100px', align: 'center',
        render: (val: boolean) => val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
    }, {
        title: '创建时间', dataIndex: 'cTime', key: 'cTime', width: '200px', align: 'center',
        sorter: (m: DeviceType, n: DeviceType) => moment(m.createdAt).isAfter(moment(n.createdAt)) ? 1 : -1,
        render: (val: any, record: DeviceType) => moment(record.createdAt).format('YYYY年M月D日 HH:mm:ss')
    }];
    return columns;
}