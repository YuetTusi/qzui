import React from 'react';
import { IProp } from './PropsType';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
import Button from 'antd/lib/button';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';

/**
 * 表头定义
 */
export function getColumns(props: IProp): ColumnGroupProps[] {

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