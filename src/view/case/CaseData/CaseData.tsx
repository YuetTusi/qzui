import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent, IObject } from '@src/type/model';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Form, { FormComponentProps } from 'antd/lib/form';
import Table from 'antd/lib/table';
import InnerPhoneTable from './InnerPhoneTable';
import CCaseInfo from '@src/schema/CCaseInfo';
import { getColumns } from './columns';
import { StoreModel } from '@src/model/case/CaseData/CaseData';
import { PhoneDataModel } from '@src/model/case/CaseData/InnerPhoneTable';
import './CaseData.less';

interface IProp extends StoreComponent, FormComponentProps {
    caseData: StoreModel;
}
interface IState { }

/**
 * 案件信息维护
 * 对应模型：model/settings/Case
 */
const WrappedCase = Form.create<IProp>({ name: 'search' })(
    class CaseData extends Component<IProp, IState> {
        constructor(props: IProp) {
            super(props);
        }
        componentDidMount() {
            this.props.dispatch({ type: "caseData/fetchCaseData" });
        }
        /**
         * 查询
         */
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            const { getFieldsValue } = this.props.form;
            // const { caseName } = getFieldsValue();
            e.preventDefault();
            this.props.dispatch({ type: "caseData/fetchCaseData" });
        }
        /**
         * 手机子表格删除回调方法
         */
        subDelHandle = (data: PhoneDataModel, casePath: string) => {
            const { dispatch } = this.props;
            Modal.confirm({
                title: '删除手机数据',
                content: `确认删除「${data.phoneName}」手机数据吗？`,
                okText: '是',
                cancelText: '否',
                onOk() {
                    dispatch({
                        type: 'caseData/deletePhoneData', payload: {
                            phonePath: data.phonePath,
                            casePath
                        }
                    });
                }
            });
        }
        /**
         * 渲染查询表单
         */
        renderSearchForm(): JSX.Element {
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
        renderSubTable = (record: IObject): JSX.Element => {
            const { m_strCaseName } = record;
            return <InnerPhoneTable delHandle={this.subDelHandle} caseName={m_strCaseName} />;
        }
        render(): JSX.Element {
            const { dispatch, caseData: { loading, caseData } } = this.props;
            return <div className="case-panel">
                <div className="case-content">
                    <Table<CCaseInfo>
                        columns={getColumns(dispatch)}
                        expandedRowRender={this.renderSubTable}
                        dataSource={caseData}
                        locale={{ emptyText: <Empty description="暂无数据" /> }}
                        rowKey={(record: CCaseInfo) => record.m_strCaseName}
                        bordered={true}
                        pagination={{ pageSize: 10 }}
                        loading={loading} />
                </div>
                <div className="fix-buttons">
                    <Button
                        type="primary"
                        icon="plus"
                        onClick={() => this.props.dispatch(routerRedux.push('/case/case-add'))}>
                        创建新案件
                    </Button>
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ 'caseData': state.caseData }))(WrappedCase);