import React, { Component, ReactElement } from 'react';
import { IComponent, IObject } from '@src/type/model';
import { Table } from 'antd';
import Title from '@src/components/title/Title';
import InnerPhoneTable from './InnerPhoneTable';
import './Case.less';
import { helper } from '@src/utils/helper';

interface IProp extends IComponent { }

const columns = [
    { title: '案件名称', dataIndex: 'caseName', key: 'caseName' },
    { title: '删除', key: 'del', width: '100px', render: () => <a>删除</a> },
];
const data: any = [{
    caseName: 'Case_201908011111',
    key: helper.getKey()
}, {
    caseName: 'Case_201908022222',
    key: helper.getKey()
}];


/**
 * @description 案件信息维护
 */
class Case extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {

        const renderInnerTable = (record: IObject) => <InnerPhoneTable id={record.caseName} />;

        return <div className="case-panel">
            <Title okText="新增" returnText="返回">案件信息</Title>
            <Table columns={columns} expandedRowRender={renderInnerTable} onExpand={(expanded: boolean, record: IObject) => {
                console.log(this);
                console.log(record);
            }}
                dataSource={data} rowKey={(record: IObject) => record.key}></Table>
        </div>
    }
}
export default Case;