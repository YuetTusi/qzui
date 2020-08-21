import path from 'path';
import fs from 'fs';
import { remote, OpenDialogReturnValue } from 'electron';
import React from 'react';
import moment from 'moment';
import debounce from 'lodash/debounce';
import Badge from 'antd/lib/badge';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from "antd/lib/table/ColumnGroup";
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import { TableName } from '@src/schema/db/TableName';
import { helper } from '@src/utils/helper';
import logger from '@src/utils/log';
import Db from '@src/utils/db';
import { Prop } from './componentType';

type SetDataHandle = (data: DeviceType[]) => void;
type SetLoadingHandle = (loading: boolean) => void;

/**
 * 使用系统窗口打开路径
 */
const openOnSystemWindow = debounce((defaultPath: string) => {
    fs.access(defaultPath, err => {
        if (err) {
            message.destroy();
            message.warning('取证数据不存在');
        } else {
            remote.shell.showItemInFolder(defaultPath);
        }
    });

}, 500, { leading: true, trailing: false });

/**
 * 表头定义
 * @param props 组件属性
 */
function getColumns(props: Prop, setDataHandle: SetDataHandle, setLoadingHandle: SetLoadingHandle): ColumnGroupProps[] {

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
                            openOnSystemWindow(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.NotParse:
                    return <span>
                        <Badge color="silver" />
                        <a onClick={() => {
                            openOnSystemWindow(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.Finished:
                    return <span>
                        <Badge color="green" />
                        <a onClick={() => {
                            openOnSystemWindow(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.Error:
                    return <span>
                        <Badge color="red" />
                        <a onClick={() => {
                            openOnSystemWindow(record.phonePath!);
                        }}>{name}</a>
                    </span>;
                case ParseState.Parsing:
                    return <span>
                        <Badge color="blue" status="processing" />
                        <a onClick={() => {
                            openOnSystemWindow(record.phonePath!);
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
                    if (state === ParseState.NotParse) {
                        startParseHandle(record);
                    } else {
                        Modal.confirm({
                            title: '请确认',
                            content: '确定再次解析吗？',
                            okText: '是',
                            cancelText: '否',
                            onOk() {
                                startParseHandle(record);
                            }
                        });
                    }

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
                    props.toBcpHandle(record, record.caseId!);
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
    }, {
        title: '删除',
        dataIndex: 'parseState',
        key: 'del',
        width: '75px',
        align: 'center',
        render(state: ParseState, record: DeviceType) {

            if (state === ParseState.Parsing || state === ParseState.Fetching) {
                return <span style={{ cursor: 'not-allowed' }}>删除</span>;
            } else {
                return <a onClick={() => {
                    Modal.confirm({
                        title: `删除「${record.mobileName?.split('_')[0]}」数据`,
                        content: `确认删除该取证数据吗？`,
                        okText: '是',
                        cancelText: '否',
                        async onOk() {
                            const db = new Db<DeviceType>(TableName.Device);
                            const modal = Modal.info({
                                content: '正在删除，请不要关闭程序',
                                okText: '确定',
                                maskClosable: false,
                                okButtonProps: { disabled: true, icon: 'loading' }
                            });
                            try {
                                setLoadingHandle(true);
                                let success = await helper.delDiskFile(record.phonePath!);
                                if (success) {
                                    modal.update({ content: '删除成功', okButtonProps: { disabled: false, icon: 'check-circle' } });
                                    //NOTE:磁盘文件删除成功后，更新数据库
                                    await db.remove({ _id: record._id });
                                    let next = await db.find({ caseId: record.caseId });
                                    setDataHandle(next);
                                } else {
                                    modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                                }
                                setTimeout(() => {
                                    modal.destroy();
                                }, 1500);
                            } catch (error) {
                                console.log(`@view/CaseData/InnerPhoneTable/columns: ${error.message}`);
                                modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                                setTimeout(() => {
                                    modal.destroy();
                                }, 1500);
                            } finally {
                                setLoadingHandle(false);
                            }
                        }
                    });
                }}>删除</a>;
            }
        }
    }];
    return columns;
}

export { getColumns };