import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { IObject, IComponent } from '@type/model';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import './Calendar.less';
import { Table } from 'antd';

interface IProp extends IComponent { }

const columns: Array<IObject> = [
    { title: '内容', dataIndex: 'col1', key: 'col1' },
    { title: '描述', dataIndex: 'col2', key: 'col2' },
    { title: '事件地点', dataIndex: 'col3', key: 'col3' },
    { title: '开始时间', dataIndex: 'col4', key: 'col4' },
    { title: '结束时间', dataIndex: 'col5', key: 'col5' }
];
const data: Array<IObject> = [
    {
        col1: '元旦',
        col2: '元旦',
        col3: '北京市',
        col4: '2019-01-01',
        col5: '2019-01-01'
    },
];

/**
 * @description 日历
 */
class Calendar extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="calendar">
            <Title returnText="返回"
                onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                日历
            </Title>
            <div className="cal-panel">
                <Table columns={columns} dataSource={data}
                    pagination={{ position: "bottom" }} />
            </div>
        </div>
    }
}
export default connect((state: IObject) => (state))(Calendar);