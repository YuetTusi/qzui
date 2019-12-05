import React, { Component, ReactNode, useEffect, useState } from 'react';
import Table from 'antd/lib/table';
import { helper } from '@utils/helper';
import { IObject } from '@src/type/model';

interface IProp {
    id: string;
    delHandle: (id: string) => void;
}
interface IState {
    isLoading: boolean;
    phoneData: any;
}

const columns = [{
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand'
}, {
    title: '型号',
    dataIndex: 'phoneType',
    key: 'phoneType'
}, {
    title: '序列号',
    dataIndex: 'serialNumber',
    key: 'serialNumber'
}, {
    title: '删除',
    key: 'del',
    width: 100,
    render: (record: IObject) => {
        return <a data-id={record.serialNumber} onClick={() => alert(record.serialNumber)}>删除</a>;
    }
}];



class InnerPhoneTable extends Component<IProp, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            phoneData: [],
            isLoading: false
        }
    }
    componentDidMount() {
        console.log('主键id:', this.props.id);
        this.fetchData();
    }

    fetchData = () => {
        let data: any = [];
        this.setState({ isLoading: true });
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                data.push({
                    brand: '品牌',
                    phoneType: "型号",
                    serialNumber: helper.getKey()
                });
            }
            this.setState({ phoneData: data, isLoading: false });
        }, 1000);
    }

    render(): ReactNode {
        return <Table columns={columns} dataSource={this.state.phoneData} loading={this.state.isLoading}
            pagination={false} size="small" locale={{ emptyText: '暂无数据' }}
            rowKey={(record: IObject) => record.serialNumber}>
        </Table>
    }
}


// function InnerPhoneTable(record: IObject, index: number, indent: number, expanded: boolean): ReactNode {

//     console.log(record);

//     return <Table columns={columns} dataSource={data} pagination={false}
//         rowKey={(record: IObject) => record.serialNumber}>
//     </Table>
// }

export default InnerPhoneTable;