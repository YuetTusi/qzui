import React from 'react';
import { Dispatch } from 'redux';
import Tag from 'antd/lib/tag';
import Icon from 'antd/lib/icon';

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>) {

    const columns = [
        {
            title: '手机名称',
            dataIndex: 'col0',
            key: 'col0',
            width: '260px'
        }, {
            title: '手机持有人',
            dataIndex: 'col1',
            key: 'col1',
            width: '120px'
        }, {
            title: '检验员',
            dataIndex: 'col2',
            key: 'col2',
            width: '120px'
        }, {
            title: '状态',
            dataIndex: 'col3',
            key: 'col3',
            render: (value: number) => {
                switch (value) {
                    case 1:
                        return <Tag color="cyan">
                            <Icon type="sync" spin={true} />
                            <span className="status-tag">正在拉取数据</span>
                        </Tag>;
                    case 2:
                        return <Tag color="magenta">
                            <Icon type="sync" spin={true} />
                            <span className="status-tag">正在解析微信数据，正在解析微信数据，正在解析微信数据，正在解析微信数据，，正在解析微信数据,，正在解析微信数据,，正在解析微信数据正在解析微信数据，正在解析微信数据</span>
                        </Tag>;
                    default:
                        return <Tag color="lime">
                            <Icon type="sync" spin={true} />
                            <span className="status-tag">正在解析数据</span>
                        </Tag>;
                }
            }
        }
    ];
    return columns;
}