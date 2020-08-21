import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent } from '@src/type/model';
import moment from 'moment';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Form, { FormComponentProps } from 'antd/lib/form';
import Table from 'antd/lib/table';
import { withModeButton } from '@src/components/enhance';
import InnerPhoneTable from './components/InnerPhoneTable';
import CCaseInfo from '@src/schema/CCaseInfo';
import { getColumns } from './columns';
import { StoreModel } from '@src/model/case/CaseData/CaseData';
import './CaseData.less';

const ModeButton = withModeButton()(Button);

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
         * 渲染子表格
         */
        renderSubTable = ({ _id }: CCaseInfo): JSX.Element => {
            return <InnerPhoneTable
                caseId={_id!} />;
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
                    <ModeButton
                        type="primary"
                        icon="plus"
                        onClick={() => this.props.dispatch(routerRedux.push('/case/case-add'))}>
                        创建新案件
                    </ModeButton>
                </div>
            </div>
        }
    }
);

export default connect((state: any) => ({ 'caseData': state.caseData }))(WrappedCase);