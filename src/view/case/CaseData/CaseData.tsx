import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent } from '@src/type/model';
import moment from 'moment';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Form, { FormComponentProps } from 'antd/lib/form';
import Table from 'antd/lib/table';
import InnerPhoneTable from './components/InnerPhoneTable';
import CCaseInfo from '@src/schema/CCaseInfo';
import { getColumns } from './columns';
import { StoreModel } from '@src/model/case/CaseData/CaseData';
import DeviceType from '@src/schema/socket/DeviceType';
import { LeftUnderline } from '@utils/regex';
import { helper } from '@src/utils/helper';
import './CaseData.less';

interface Prop extends StoreComponent, FormComponentProps {
    caseData: StoreModel;
}
interface State { }

/**
 * 案件信息维护
 * 对应模型：model/settings/Case
 */
const WrappedCase = Form.create<Prop>({ name: 'search' })(
    class CaseData extends Component<Prop, State> {
        constructor(props: Prop) {
            super(props);
        }
        componentDidMount() {
            this.props.dispatch({ type: "caseData/fetchCaseData", payload: { current: 1 } });
        }
        /**
         * 查询
         */
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            this.props.dispatch({ type: "caseData/fetchCaseData", payload: { current: 1 } });
        }
        /**
         * 手机子表格删除回调方法
         * @param data 设备数据
         * @param caseId 案件id
         */
        subDelHandle = (data: DeviceType, caseId: string) => {
            const { dispatch } = this.props;
            let matchArr = data.mobileName?.match(LeftUnderline);
            let onlyName = data.mobileName;

            if (!helper.isNullOrUndefined(matchArr)) {
                onlyName = matchArr![0];
            }

            Modal.confirm({
                title: `删除「${onlyName}」数据`,
                content: `确认删除该取证数据吗？`,
                okText: '是',
                cancelText: '否',
                onOk() {
                    dispatch({
                        type: 'caseData/deleteDevice', payload: {
                            caseId,
                            data
                        }
                    });
                }
            });
        }
        /**
         * 翻页Change
         */
        pageChange = (current: number, pageSize?: number) => {
            this.props.dispatch({
                type: "caseData/fetchCaseData", payload: {
                    current,
                    pageSize
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
        renderSubTable = ({ _id, devices }: CCaseInfo): JSX.Element => {
            devices.sort((m, n) => moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1);
            return <InnerPhoneTable
                delHandle={this.subDelHandle}
                caseId={_id!}
                data={devices} />;
        }
        render(): JSX.Element {
            const { dispatch, caseData: {
                loading, caseData,
                total, current, pageSize
            } } = this.props;
            return <div className="case-panel">
                <div className="case-content">
                    <Table<CCaseInfo>
                        columns={getColumns(dispatch)}
                        expandedRowRender={this.renderSubTable}
                        expandRowByClick={true}
                        dataSource={caseData}
                        locale={{ emptyText: <Empty description="暂无数据" /> }}
                        rowKey={(record: CCaseInfo) => record.m_strCaseName}
                        bordered={true}
                        pagination={{
                            total,
                            current,
                            pageSize,
                            onChange: this.pageChange
                        }}
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

export default connect((state: any) => ({ 'caseData': state.caseData }))(WrappedCase);