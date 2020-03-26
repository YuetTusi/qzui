import React, { Component } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Form, { FormComponentProps } from 'antd/lib/form';
import Table from 'antd/lib/table';
import CFetchLog from '@src/schema/CFetchLog';
import './FetchLog.less';
import locale from 'antd/es/date-picker/locale/zh_CN';
import DatePicker from 'antd/lib/date-picker';
import { getColumns } from './columns';
import { StoreComponent } from '@src/type/model';
import { StoreData } from '@src/model/operation/FetchLog/FetchLog';
import { helper } from '@src/utils/helper';
import { Moment } from 'moment';

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
            const { dispatch } = this.props;
            dispatch({ type: 'fetchLog/queryAllFetchLog' });
        }
        searchFormSubmit = () => {
            const { dispatch } = this.props;
            const { getFieldsValue } = this.props.form;
            let { start, end } = getFieldsValue();
            dispatch({
                type: 'fetchLog/queryByDateRange', payload: {
                    start: helper.isNullOrUndefined(start) ? null : (start as Moment).format('YYYY-MM-DD HH:mm:ss'),
                    end: helper.isNullOrUndefined(end) ? null : (end as Moment).format('YYYY-MM-DD HH:mm:ss')
                }
            });
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
        renderTable = (data: CFetchLog[]): JSX.Element => {
            const { dispatch } = this.props;
            const { loading } = this.props.fetchLog;
            return <Table<CFetchLog>
                columns={getColumns(dispatch)}
                dataSource={data}
                bordered={true}
                loading={loading}
                size="small"
                pagination={{ pageSize: 20 }} />;
        }
        render(): JSX.Element {
            const { data } = this.props.fetchLog;
            return <div className="fetch-log-root">
                <div className="search-form">
                    {this.renderForm()}
                </div>
                <div className="table-panel">
                    {this.renderTable(data)}
                </div>
            </div>
        }
    }
);

export default connect((state: any) => ({ fetchLog: state.fetchLog }))(ExtendFetchLog);