import path from 'path';
import React from 'react';
import { IProp } from './PropsType';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { helper } from '@utils/helper';
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
                <span>{val.split('_')[0]}</span>
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
        title: '取证时间',
        dataIndex: 'strPhone_',
        key: 'timestamp',
        width: 180,
        align: 'center',
        render(val: string, record: UIRetOneInfo) {
            const [, timestamp] = val.split('_');
            let time = helper.isNullOrUndefined(timestamp) ? '' : helper.parseDate(timestamp, 'YYYYMMDDHHmmSSSS').format('YYYY年M月D日 HH:mm:SS');
            return <div>
                <span>{time}</span>
            </div>;
        }
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
        title: '查看报告', dataIndex: 'report', key: 'report', width: '80px', align: 'center',
        render(val: any, record: UIRetOneInfo) {
            //报表应用路径
            const readerPath = path.join(publishPath, '../../../', (config as any).readerPath);
            return <Button
                type="primary"
                size="small"
                disabled={record.status_ !== 0}
                onClick={() => {
                    helper.runExe(readerPath, [record.PhonePath_!]).catch((errMsg: string) => {
                        console.log(errMsg);
                        Modal.warning({
                            title: '启动失败',
                            content: '报告启动失败，请联系技术支持'
                        });
                    });
                }}>查看报告</Button>;
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