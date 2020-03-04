import React, { Component, ReactNode } from 'react';
import { connect } from 'dva';
import Table from 'antd/lib/table';
import { helper } from '@utils/helper';
import { StoreComponent } from '@src/type/model';
import { StoreModel, CaseDataModel, PhoneDataModel } from '@src/model/case/CaseData/innerPhoneTable';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import './InnerPhoneTable.less';

interface IProp extends StoreComponent {
    /**
     * 案件路径
     */
    caseName: string;
    /**
     * 删除Handle
     * @param arg0 组件属性
     * @param arg1 案件路径
     */
    delHandle: (arg0: PhoneDataModel, args1: string) => void;
    /**
     * 仓库模型
     */
    innerPhoneTable: StoreModel;
}
interface IState {
    isLoading: boolean;
    phoneData: any;
}

/**
 * 表头定义
 * @param param0 组件属性
 * @param casePath 案件路径
 */
function getColumns({ delHandle }: IProp, casePath: string): ColumnGroupProps[] {
    const columns = [{
        title: '手机',
        dataIndex: 'phoneName',
        key: 'phoneName'
    }, {
        title: '取证时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: '200px',
        align: 'center'
    }, {
        title: '删除',
        key: 'del',
        width: 100,
        align: 'center',
        render: (record: PhoneDataModel) => {
            return <a onClick={() => delHandle(record, casePath)}>删除</a>;
        }
    }];
    return columns;
}


/**
 * 手机子表格组件
 */
class InnerPhoneTable extends Component<IProp, IState> {
    //父表格传来的案件路径
    private casePath: string;
    constructor(props: any) {
        super(props);
        this.state = {
            phoneData: [],
            isLoading: false
        };
        this.casePath = '';
    }
    componentDidMount() {
        this.fetchData(this.props.caseName);
    }
    /**
     * 查询手机列表数据
     * @param casePath 案件绝对路径
     */
    fetchData = (casePath: string) => {
        const { dispatch } = this.props;
        this.casePath = casePath;
        dispatch({ type: 'innerPhoneTable/fetchPhoneDataByCase', payload: casePath });
    }
    render(): JSX.Element {
        const { caseData } = this.props.innerPhoneTable;
        let data: PhoneDataModel[] = [];
        let temp = caseData.find((item: CaseDataModel) => item.caseName === this.casePath);
        if (temp !== undefined) {
            data = temp.phoneDataList;
        }
        return <div className="case-inner-table">
            <Table<PhoneDataModel>
                columns={getColumns(this.props, this.casePath)}
                dataSource={data}
                pagination={false}
                size="middle"
                locale={{ emptyText: '无手机数据' }}
                rowClassName={(record: PhoneDataModel, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
                rowKey={(record: PhoneDataModel) => helper.getKey()}>
            </Table>
        </div>;
    }
}

export default connect((state: any) => ({ innerPhoneTable: state.innerPhoneTable }))(InnerPhoneTable);