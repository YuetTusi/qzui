import React from 'react';
import moment from 'moment';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import { Prop } from './componentType';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import { LeftUnderline } from '@src/utils/regex';
import NoWrapText from '@src/components/NoWrapText/NoWrapText';
import { ParseState } from '@src/schema/socket/DeviceState';
import CCaseInfo from '@src/schema/CCaseInfo';
import { ProgressPlugin } from 'webpack';

/**
 * 表头定义
 * @param param0 组件属性
 * @param casePath 案件路径
 */
function getColumns(props: Prop): ColumnGroupProps[] {

    const { caseId, appIds, startParseHandle } = props;

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
        title: '备注',
        dataIndex: 'note',
        key: 'note',
        width: '150px',
        render(value: string) {
            return <NoWrapText width={130}>{value}</NoWrapText>
        }
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
        title: '状态',
        dataIndex: 'parseState',
        key: 'parseState',
        width: '80px',
        align: 'center',
        render(state: ParseState, record: any) {
            switch (state) {
                case ParseState.NotParse:
                    return <Tag>未解析</Tag>;
                case ParseState.Parsing:
                    return <Tag color="blue">解析中</Tag>;
                case ParseState.Finished:
                    return <Tag color="green">完成</Tag>;
                case ParseState.Error:
                    return <Tag color="red">失败</Tag>;
                default:
                    return <Tag>未解析</Tag>;
            }
        }
    }, {
        title: '解析',
        dataIndex: 'parseState',
        key: 'start',
        width: '80px',
        align: 'center',
        render(state: ParseState, record: DeviceType) {

            if (helper.isNullOrUndefined(state) || state === ParseState.NotParse || state === ParseState.Error) {
                return <Button type="primary" size="small" onClick={() => {
                    startParseHandle(caseId, appIds, record);
                }}>解析</Button>;
            } else {
                return <Button type="primary" size="small" disabled={true}>解析</Button>;
            }
        }
    }];
    return columns;
}

export { getColumns };