import React from "react";
import { Dispatch } from 'redux';
import { routerRedux } from "dva/router";
import { Tag } from 'antd';

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
            width: '200px'
        }, {
            title: '手机持有人',
            dataIndex: 'col1',
            key: 'col1',
            width: '150px'
        }, {
            title: '检验员',
            dataIndex: 'col2',
            key: 'col2',
            width: '150px'
        }, {
            title: '状态',
            dataIndex: 'col3',
            key: 'col3',
            render: (value: number) => {
                switch (value) {
                    case 1:
                        return <Tag color="cyan">正在拉取数据</Tag>;
                    case 2:
                        return <Tag color="magenta">正在解析微信数据，正在解析微信数据，正在解析微信数据</Tag>;
                    default:
                        return <Tag color="lime">正在解析数据</Tag>;
                }
            }
        }, {
            title: '详情',
            key: 'col4',
            width: '60px',
            render: () => {
                return <a
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => dispatch(routerRedux.push('/record/parsing'))}>详情</a>;
            }
        }
    ];
    return columns;
}