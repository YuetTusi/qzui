import React from 'react';
import moment from 'moment';
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import { Prop } from './componentTyps';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import { LeftUnderline } from '@src/utils/regex';

/**
 * 表头定义
 * @param param0 组件属性
 * @param casePath 案件路径
 */
function getColumns({ delHandle, caseId }: Prop): ColumnGroupProps[] {

    const columns = [{
        title: '手机名称',
        dataIndex: 'mobileName',
        key: 'mobileName',
        render(value: string) {
            if (value.match(LeftUnderline)) {
                return value.match(LeftUnderline)![0];
            } else {
                return value;
            }
        }
    }, {
        title: '手机持有人',
        dataIndex: 'mobileHolder',
        key: 'mobileHolder',
        width: '150px'
    }, {
        title: '手机编号',
        dataIndex: 'mobileNo',
        key: 'mobileNo',
        width: '150px'
    }, {
        title: '取证时间',
        dataIndex: 'fetchTime',
        key: 'fetchTime',
        width: '180px',
        align: 'center',
        sorter(m: DeviceType, n: DeviceType) {
            let isAfter = moment(m.fetchTime).isAfter(moment(n.fetchTime));
            return isAfter ? 1 : -1;
        },
        render(value: Date) {
            if (helper.isNullOrUndefined(value)) {
                return helper.EMPTY_STRING;
            } else {
                return moment(value).format('YYYY年M月D日 HH:mm:ss');
            }
        }
    }, {
        title: '删除',
        key: 'del',
        width: 100,
        align: 'center',
        render: (record: DeviceType) => {
            return <a onClick={() => delHandle(record, caseId)}>删除</a>;
        }
    }];
    return columns;
}

export { getColumns };