import React, { Component, ReactElement, FormEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@src/type/model';
import { Table, Form, Button, Icon, Input, Empty } from 'antd';
import Title from '@src/components/title/Title';
import InnerPhoneTable from './InnerPhoneTable';
import CCaseInfo from '@src/schema/CCaseInfo';
import { getColumns } from './columns';
import { FormComponentProps } from 'antd/lib/form';
import './Case.less';

interface IProp extends IComponent, FormComponentProps {
    case: IObject;
}
interface IState {
}

/**
 * 案件信息维护
 * 对应模型：model/settings/Case
 */
const WrappedCase = Form.create<IProp>({ name: 'search' })(
    class Case extends Component<IProp, IState> {
        constructor(props: IProp) {
            super(props);
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
            this.props.dispatch({ type: "case/fetchCaseData" });
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
        renderSubTable = (record: IObject): ReactElement => {
            return <InnerPhoneTable id={record.caseName} delHandle={this.subDelHandle} />;
        }
        render(): ReactElement {
            const { dispatch, case: { loading, caseData } } = this.props;
            return <div className="case-panel">
                <Title
                    okText="新增"
                    onOk={() => this.props.dispatch(routerRedux.push('/settings/case/add'))}>案件信息</Title>
                <div className="case-content">
                    <Table<CCaseInfo>
                        columns={getColumns(dispatch)}
                        expandedRowRender={this.renderSubTable}
                        dataSource={caseData}
                        locale={{ emptyText: <Empty description="暂无数据" /> }}
                        rowKey={(record: CCaseInfo) => record.m_strCaseName}
                        bordered={false}
                        pagination={{ pageSize: 10 }}
                        loading={loading} />
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ 'case': state.case }))(WrappedCase);