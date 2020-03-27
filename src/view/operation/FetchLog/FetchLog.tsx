import React, { Component } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Form, { FormComponentProps } from 'antd/lib/form';
import Table from 'antd/lib/table';
import CFetchLog from '@src/schema/CFetchLog';
import locale from 'antd/es/date-picker/locale/zh_CN';
import DatePicker from 'antd/lib/date-picker';
import { getColumns } from './columns';
import { StoreComponent } from '@src/type/model';
import { StoreData } from '@src/model/operation/FetchLog/FetchLog';
import { helper } from '@src/utils/helper';
import { Moment } from 'moment';
import './FetchLog.less';

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库对象
     */
    fetchLog: StoreData;
}
interface State {
}

const ExtendFetchLog = Form.create<Prop>({ name: 'SearchForm' })(
    /**
     * 采集日志
     */
    class FetchLog extends Component<Prop, State> {
        constructor(props: any) {
            super(props);
        }
        componentDidMount() {
            this.queryTable({}, 1, 15);
        }
        /**
         * 查询表格数据
         */
        queryTable(condition: any, current: number, pageSize: number = 20) {
            const { dispatch } = this.props;
            dispatch({
                type: 'fetchLog/queryAllFetchLog', payload: {
                    condition,
                    current,
                    pageSize
                }
            });
        }
        /**
         * 查询表单提交
         */
        searchFormSubmit = () => {
            const { getFieldsValue } = this.props.form;
            let { start, end } = getFieldsValue();
            this.queryTable({
                start: helper.isNullOrUndefined(start) ? start : (start as Moment).format('YYYY-MM-DD HH:mm:ss'),
                end: helper.isNullOrUndefined(end) ? end : (end as Moment).format('YYYY-MM-DD HH:mm:ss')
            }, 1, 15);
        }
        /**
         * 翻页Change
         */
        pageChange = (current: number, pageSize?: number) => {
            const { getFieldsValue } = this.props.form;
            let { start, end } = getFieldsValue();
            this.queryTable({
                start: helper.isNullOrUndefined(start) ? start : (start as Moment).format('YYYY-MM-DD HH:mm:ss'),
                end: helper.isNullOrUndefined(end) ? end : (end as Moment).format('YYYY-MM-DD HH:mm:ss')
            }, current, pageSize);
        }
        renderForm = () => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            return <Form layout="inline">
                <Item label="结束时间-起">
                    {getFieldDecorator('start')(
                        <DatePicker showTime={true} placeholder="" locale={locale} />
                    )}
                </Item>
                <Item label="结束时间-止">
                    {getFieldDecorator('end')(
                        <DatePicker showTime={true} placeholder="" locale={locale} />
                    )}
                </Item>
                <Item>
                    <Button type="primary" onClick={this.searchFormSubmit}>
                        <Icon type="search" />
                        <span>查询</span>
                    </Button>
                </Item>
            </Form>
        }
        renderTable = (data: CFetchLog[], total: number): JSX.Element => {
            const { dispatch } = this.props;
            const { loading, current, pageSize } = this.props.fetchLog;
            return <Table<CFetchLog>
                columns={getColumns(dispatch)}
                dataSource={data}
                bordered={true}
                loading={loading}
                size="small"
                locale={{ emptyText: <Empty description="暂无数据" /> }}
                pagination={{
                    total,
                    current,
                    pageSize,
                    onChange: this.pageChange
                }} />;
        }
        render(): JSX.Element {
            const { data, total } = this.props.fetchLog;
            return <div className="fetch-log-root">
                <div className="search-form">
                    {this.renderForm()}
                </div>
                <div className="table-panel">
                    {this.renderTable(data, total)}
                </div>
            </div>
        }
    }
);

export default connect((state: any) => ({ fetchLog: state.fetchLog }))(ExtendFetchLog);