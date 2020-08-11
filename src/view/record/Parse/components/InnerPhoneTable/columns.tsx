import path from 'path';
import fs from 'fs';
import { remote, OpenDialogReturnValue } from 'electron';
import React from 'react';
import moment from 'moment';
import Badge from 'antd/lib/badge';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import message from 'antd/lib/message';
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import { helper } from '@src/utils/helper';
import logger from '@src/utils/log';
import { Prop } from './componentType';

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
                case ParseState.Fetching:
                    return <span>
                        <Badge color="silver" />
                        <a onClick={() => {
                            remote.shell.showItemInFolder(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.NotParse:
                    return <span>
                        <Badge color="silver" />
                        <a onClick={() => {
                            remote.shell.showItemInFolder(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.Finished:
                    return <span>
                        <Badge color="green" />
                        <a onClick={() => {
                            remote.shell.showItemInFolder(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.Error:
                    return <span>
                        <Badge color="red" />
                        <a onClick={() => {
                            remote.shell.showItemInFolder(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.Parsing:
                    return <span>
                        <Badge color="blue" status="processing" />
                        <a onClick={() => {
                            remote.shell.showItemInFolder(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                default:
                    return <span>{name}</span>;
            }
        }
    }, {
        title: '手机持有人',
        dataIndex: 'mobileHolder',
        key: 'mobileHolder'
    }, {
        title: '手机编号',
        dataIndex: 'mobileNo',
        key: 'mobileNo'
    }, {
        title: '备注',
        dataIndex: 'note',
        key: 'note'
    }, {
        title: '取证时间',
        dataIndex: 'fetchTime',
        key: 'fetchTime',
        width: '170px',
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
                disabled={state !== ParseState.Finished && state !== ParseState.Error}
                type="primary"
                size="small">查看报告</Button>;
        }
    }, {
        title: '生成BCP',
        dataIndex: 'parseState',
        key: 'bcp',
        width: '75px',
        align: 'center',
        render(state: ParseState, record: DeviceType) {
            return <Button
                onClick={() => {
                    props.toBcpHandle(record);
                }}
                disabled={state === ParseState.NotParse
                    || state === ParseState.Fetching
                    || state === ParseState.Parsing}
                type="primary"
                size="small">生成BCP</Button>;
        }
    }, {
        title: '导出BCP',
        dataIndex: 'parseState',
        key: 'export',
        width: '75px',
        align: 'center',
        render(state: ParseState, record: DeviceType) {
            const bcpPath = path.join(record.phonePath!);
            try {
                fs.accessSync(bcpPath);
                let dirs: string[] = fs.readdirSync(bcpPath);
                return <Button
                    type="primary"
                    size="small"
                    disabled={!dirs.includes('BCP')}
                    onClick={() => {
                        remote.dialog.showOpenDialog({
                            title: '导出BCP',
                            properties: ['openFile'],
                            defaultPath: path.join(bcpPath, 'BCP'),
                            filters: [{ name: 'BCP文件', extensions: ['zip'] }]
                        }).then((value: OpenDialogReturnValue) => {
                            if ((value.filePaths as string[]).length > 0) {
                                window.location.href = value.filePaths[0];
                            }
                        });
                    }}>导出BCP</Button>;
            } catch (error) {
                return <Button
                    type="primary"
                    size="small"
                    disabled={true}>导出BCP</Button>;
            }
        }
    }];
    return columns;
}

export { getColumns };