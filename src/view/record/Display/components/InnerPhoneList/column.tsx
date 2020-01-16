import path from 'path';
import { execFile } from 'child_process';
import React from 'react';
import { IProp } from './PropsType';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import config from '@src/config/ui.config.json';

/**
 * 表头定义
 * @param props 组件属性
 * @param publishPath  发布目录
 */
export function getColumns(props: IProp, publishPath: string = "C:\\"): ColumnGroupProps[] {

    const { parsingHandle, detailHandle } = props;

    const columns = [{
        title: '手机名称',
        dataIndex: 'strPhone_',
        key: 'strPhone_',
        render(val: string, record: UIRetOneInfo) {
            let $state: JSX.Element | null = null;
            switch (record.status_) {
                case 0:
                    $state = <Badge color="green" />;
                    break;
                case 1:
                    $state = <Badge color="silver" />;
                    break;
                case 2:
                    $state = <Badge status="processing" />;
                    break;
                default:
                    $state = <Badge color="silver" />;
                    break;
            }
            return <div>
                {$state}
                <span>{val}</span>
            </div>;
        }
    }, {
        title: '手机持有人',
        dataIndex: 'DeviceHolder_',
        key: 'DeviceHolder_',
        width: '200px'
    }, {
        title: '设备编号',
        dataIndex: 'DeviceNumber_',
        key: 'DeviceNumber_',
        width: '200px'
    }, {
        title: '解 析', dataIndex: 'status', key: 'status', width: '80px', align: 'center',
        render(val: any, record: UIRetOneInfo) {
            if (record.status_ === 1) {
                return <Button type="link" onClick={() => parsingHandle(record)}>解析</Button>;
            } else {
                return <Button type="link" onClick={() => parsingHandle(record)} disabled={true}>解析</Button>;
            }
        }
    }, {
        title: '详 情',
        dataIndex: 'detail',
        key: 'detail',
        width: '80px',
        align: 'center',
        render(val: any, record: UIRetOneInfo) {
            switch (record.status_) {
                case 0:
                    //#完成
                    return <Button type="link" disabled={true}>详情</Button>;
                case 1:
                    //#未解析
                    return <Button type="link" disabled={true}>详情</Button>;
                case 2:
                    //#解析中
                    return <Button type="link" onClick={() => detailHandle(record)}>详情</Button>;
                default:
                    return <Button type="link" disabled={true}>详情</Button>;
            }
        }
    }, {
        title: '报 告', dataIndex: 'report', key: 'report', width: '80px', align: 'center',
        render(val: any, record: UIRetOneInfo) {
            //报表应用路径
            const readerPath = path.join(publishPath, '../../../', (config as any).defenderPath);
            const { PhonePath } = record;
            return <Button type="link" onClick={() => {
                runExe(readerPath, [PhonePath!]);
            }}>报 告</Button>;
        }
    }, {
        title: '状 态',
        dataIndex: 'status_',
        key: 'status_',
        width: '100px',
        align: 'center',
        render(val: number) {
            switch (val) {
                case 0:
                    return <Tag color="green">解析完成</Tag>;
                case 1:
                    return <Tag>未解析</Tag>;
                case 2:
                    return <Tag color="blue">
                        <Icon type="sync" spin={true} />
                        <span className="tag-span">解析中</span>
                    </Tag>;
                default:
                    return <Tag>未解析</Tag>;
            }
        }
    }];
    return columns;
}

/**
 * 运行exe文件
 * @param exePath exe文件路径
 * @param args 参数列表
 */
function runExe(exePath: string, args: string[]) {
    execFile(exePath, args, {
        windowsHide: false
    }, (err: Error | null) => {
        if (err) {
            console.log(err.message);
            Modal.warning({
                title: '提示',
                content: '报表应用启动失败'
            });
        }
    });
}