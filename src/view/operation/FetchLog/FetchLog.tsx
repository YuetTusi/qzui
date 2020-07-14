import React, { Component } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Form from 'antd/lib/form';
import Table from 'antd/lib/table';
import FetchLogEntity from '@src/schema/socket/FetchLog';
import locale from 'antd/es/date-picker/locale/zh_CN';
import DatePicker from 'antd/lib/date-picker';
import { Prop, State } from './componentType';
import { getColumns } from './columns';
import DelLogModal from '../components/DelLogModal/DelLogModal';
import { helper } from '@src/utils/helper';
import { Moment } from 'moment';
import { DelLogType } from '../components/DelLogModal/ComponentType';
import RecordModal from '@src/components/RecordModal/RecordModal';
import FetchRecord from '@src/schema/socket/FetchRecord';
import './FetchLog.less';

const ExtendFetchLog = Form.create<Prop>({ name: 'SearchForm' })(
    /**
     * 采集日志
     */
    class FetchLog extends Component<Prop, State> {
        constructor(props: any) {
            super(props);
            this.state = {
                delModalVisible: false,
                recordModalVisible: false,
                record: []
            };
        }
        componentDidMount() {
            this.queryTable();
        }
        /**
         * 显示/隐藏清理弹框
         */
        showDelModalChange = (visible: boolean) => {
            this.setState({ delModalVisible: visible });
        }
        /**
         * 显示采集记录弹框
         */
        showRecordModalHandle = (record: FetchRecord[]) => {
            this.setState({
                recordModalVisible: true,
                record
            });
        }
        /**
         * 关闭采集记录弹框
         */
        cancelRecordModalHandle = () => {
            this.setState({
                recordModalVisible: false,
            });
            setTimeout(() => {
                this.setState({
                    record: []
                })
            }, 200);
        }
        /**
         * 删除日志回调
         */
        delLogHandle = (delType: DelLogType) => {
            const { dispatch } = this.props;
            dispatch({ type: 'fetchLog/deleteFetchLogByTime', payload: delType });
            this.setState({ delModalVisible: false });
        }
        /**
         * 查询表格数据
         */
        queryTable(condition: any = {}, current: number = 1, pageSize: number = 15) {
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
            const { loading } = this.props.fetchLog;
            return <div className="search-bar">
                <Form layout="inline">
                    <Item label="采集时间 起">
                        {getFieldDecorator('start')(
                            <DatePicker showTime={true} placeholder="请选择时间" locale={locale} />
                        )}
                    </Item>
                    <Item label="止">
                        {getFieldDecorator('end')(
                            <DatePicker showTime={true} placeholder="请选择时间" locale={locale} />
                        )}
                    </Item>
                    <Item>
                        <Button type="primary" onClick={this.searchFormSubmit}>
                            <Icon type={loading ? 'loading' : 'search'} />
                            <span>查询</span>
                        </Button>
                    </Item>
                </Form>
                <div>
                    <Button type="default" onClick={() => this.showDelModalChange(true)}>
                        <Icon type="delete" />
                        <span>清理</span>
                    </Button>
                </div>
            </div>;
        }
        renderTable = (data: FetchLogEntity[], total: number): JSX.Element => {
            const { loading, current, pageSize } = this.props.fetchLog;
            return <Table<FetchLogEntity>
                columns={getColumns(this)}
                dataSource={data}
                bordered={true}
                loading={loading}
                size="small"
                locale={{ emptyText: <Empty description="暂无数据" /> }}
                rowClassName={(record: FetchLogEntity, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
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
                <div className="scroll-panel">
                    <div className="table-panel">
                        {this.renderTable(data, total)}
                    </div>
                </div>
                <DelLogModal
                    visible={this.state.delModalVisible}
                    okHandle={this.delLogHandle}
                    cancelHandle={() => this.showDelModalChange(false)} />
                <RecordModal
                    visible={this.state.recordModalVisible}
                    data={this.state.record}
                    cancelHandle={() => this.cancelRecordModalHandle()} />
            </div>
        }
    }
);

export default connect((state: any) => ({ fetchLog: state.fetchLog }))(ExtendFetchLog);