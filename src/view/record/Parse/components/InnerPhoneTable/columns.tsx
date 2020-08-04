import path from 'path';
import { remote } from 'electron';
import React from 'react';
import moment from 'moment';
import Badge from 'antd/lib/badge';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import message from 'antd/lib/message';
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import { Prop } from './componentType';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';
import logger from '@src/utils/log';
import NoWrapText from '@src/components/NoWrapText/NoWrapText';
import { ParseState } from '@src/schema/socket/DeviceState';

/**
 * 表头定义
 * @param props 组件属性
 */
function getColumns(props: Prop): ColumnGroupProps[] {

    const {
        startParseHandle,
        progressHandle
    } = props;

    const columns = [{
        title: '手机名称',
        dataIndex: 'mobileName',
        key: 'mobileName',
        render(value: string, record: DeviceType) {
            let [name, timestamp] = value.split('_');
            switch (record.parseState) {
                case ParseState.NotParse:
                    return <span>
                        <Badge color="silver" />
                        <span>{name}</span>
                    </span>;
                case ParseState.Finished:
                    return <span>
                        <Badge color="green" />
                        <span>{name}</span>
                    </span>;
                case ParseState.Error:
                    return <span>
                        <Badge color="red" />
                        <span>{name}</span>
                    </span>;
                case ParseState.Parsing:
                    return <span>
                        <Badge color="blue" status="processing" />
                        <span>{name}</span>
                    </span>;
                default:
                    return <span>
                        <Badge color="silver" />
                        <span>{name}</span>
                    </span>;
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
        width: '75px',
        align: 'center',
        render(state: ParseState, record: any) {
            switch (state) {
                case ParseState.Fetching:
                    return <Tag>采集中</Tag>
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
        width: '75px',
        align: 'center',
        render(state: ParseState, record: DeviceType) {

            if (helper.isNullOrUndefined(state)
                || state === ParseState.NotParse
                || state === ParseState.Error
                || state === ParseState.Finished) {
                return <Button type="primary" size="small" onClick={() => {
                    startParseHandle(record);
                }}>解析</Button>;
            } else {
                return <Button type="primary" size="small" disabled={true}>解析</Button>;
            }
        }
    }, {
        title: '详情',
        dataIndex: 'parseState',
        key: 'progress',
        width: '75px',
        align: 'center',
        render(state: ParseState, record: DeviceType) {

            if (state === ParseState.Parsing) {
                return <Button type="primary" size="small" onClick={() => {
                    progressHandle(record);
                }}>详情</Button>;
            } else {
                return <Button type="primary" size="small" disabled={true}>详情</Button>;
            }
        }
    }, {
        title: '生成报告',
        dataIndex: 'parseState',
        key: 'create',
        width: '75px',
        align: 'center',
        render(state: ParseState, { phonePath }: DeviceType) {
            const createReportPath = path.join(remote.app.getAppPath(),
                '../../../tools/CreateReport/CreateReport.exe');
            return <Button
                onClick={() => {
                    helper.runExe(createReportPath, [phonePath!]).then(() => {
                        message.success('生成成功');
                    }).catch(err => {
                        message.error('生成失败');
                        console.log(`生成报告失败:${err}`);
                        logger.error(`生成报告失败 @view/record/Parse/InnerPhoneTable/columns: ${err}`);
                    });
                }}
                disabled={state == ParseState.Fetching || state == ParseState.NotParse || state === ParseState.Parsing}
                type="primary"
                size="small">生成报告</Button>;
        }
    }, {
        title: '查看报告',
        dataIndex: 'parseState',
        key: 'report',
        width: '75px',
        align: 'center',
        render(state: ParseState, { phonePath }: DeviceType) {
            const readerPath = path.join(remote.app.getAppPath(),
                '../../../tools/ReportReader/ReportReader.exe');
            return <Button
                onClick={() => {
                    console.log(remote.app.getAppPath());
                    console.log(readerPath);
                    console.log(phonePath);
                    helper.runExe(readerPath, [phonePath!]).catch(err => {
                        logger.error(`查看报告失败 @view/record/Parse/InnerPhoneTable/columns: ${err.message}`);
                        if (err.message.endsWith('ENOENT')) {
                            message.error('打开报告失败');
                        }
                    });
                }}
                // disabled={state !== ParseState.Finished}
                disabled={false}
                type="primary"
                size="small">查看报告</Button>;
        }
    }];
    return columns;
}

export { getColumns };