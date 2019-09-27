import React, { Component, ReactElement, FormEvent } from 'react';
import { connect } from 'dva';
import { IComponent, IObject } from '@src/type/model';
import { Table, Form, Button, Icon, Input, Empty } from 'antd';
import Title from '@src/components/title/Title';
import InnerPhoneTable from './InnerPhoneTable';
import EditModal from './EditModal';
import { helper } from '@src/utils/helper';
import './Case.less';

interface IProp extends IComponent {
    form: any;
    case: IObject;
}
interface IState {
    //新增框是否显示
    modalVisible: boolean;
}

const columns = [
    { title: '案件名称', dataIndex: 'caseName', key: 'caseName' },
    {
        title: '生成BCP', dataIndex: 'bcp', key: 'bcp', width: '100px',
        render: (val: number) => val === 1 ? '是' : '否'
    },
    {
        title: '自动解析', dataIndex: 'analysis', key: 'analysis', width: '100px',
        render: (val: number) => val === 1 ? '是' : '否'
    },
    {
        title: '删除', key: 'del', width: '100px', render: (record: IObject) => {
            return <a onClick={() => alert(record.caseName)}>删除</a>;
        }
    },
];

/**
 * 案件信息维护
 * 对应模型：model/settings/Case
 */
const WrappedCase = Form.create<IProp>({ name: 'search' })(
    class Case extends Component<IProp, IState> {
        editModal: IObject;
        constructor(props: IProp) {
            super(props);
            this.editModal = {};
            this.state = { modalVisible: false };
        }
        componentDidMount() {
            this.props.dispatch({ type: "case/fetchCaseData" });
        }
        /**
         * 查询
         */
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            const { getFieldsValue } = this.props.form;
            const { caseName } = getFieldsValue();

            e.preventDefault();
            console.log(caseName);
            this.props.dispatch({ type: "case/fetchCaseData" });
        }
        /**
         * 保存案件回调
         */
        saveHandle = () => {
            const { validateFields } = this.editModal.props.form;

            validateFields((err: any, values: IObject) => {
                if (!err) {
                    console.log(values);
                }
            });
        }
        cancelHandle = () => {
            this.setState({ modalVisible: false });
        }
        /**
         * 子表格删除回调方法
         */
        subDelHandle = (id: string) => {
            alert(id);
        }
        /**
         * 渲染查询表单
         */
        renderSearchForm(): ReactElement {
            const { getFieldDecorator } = this.props.form;
            return (<div className="search-bar">
                <Form onSubmit={this.searchSubmit} layout="inline">
                    <Form.Item label="案件名称">
                        {getFieldDecorator('caseName')(<Input style={{ width: '300px' }} />)}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            <Icon type="search" />
                            <span>查询</span>
                        </Button>
                    </Form.Item>
                </Form>
            </div>);
        }
        /**
         * 渲染子表格
         */
        renderSubTable = (record: IObject) => {
            return <InnerPhoneTable id={record.caseName} delHandle={this.subDelHandle} />;
        }
        render(): ReactElement {
            return <div className="case-panel">
                <Title okText="新增" returnText="返回" onOk={() => this.setState({ modalVisible: true })}>案件信息</Title>
                <div className="case-content">
                    {this.renderSearchForm()}
                    <Table
                        columns={columns}
                        expandedRowRender={this.renderSubTable}
                        dataSource={this.props.case.caseData}
                        locale={{ emptyText: <Empty description="暂无数据" /> }}
                        rowKey={(record: IObject) => record.id}
                        pagination={{ pageSize: 10 }}
                        bordered={false} />
                    <EditModal
                        visible={this.state.modalVisible}
                        saveHandle={this.saveHandle}
                        cancelHandle={this.cancelHandle}
                        wrappedComponentRef={(instance: any) => this.editModal = instance} />
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ 'case': state.case }))(WrappedCase);