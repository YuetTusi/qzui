import React, { Component } from 'react';
import { connect } from 'dva';
import { Moment } from 'moment';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import FetchLogEntity from '@src/schema/socket/FetchLog';
import locale from 'antd/es/date-picker/locale/zh_CN';
import DatePicker from 'antd/lib/date-picker';
import { Prop, State } from './componentType';
import DelLogModal from '../components/DelLogModal/DelLogModal';
import HiddenToggle from '@src/components/HiddenToggle/HiddenToggle';
import { DelLogType } from '../components/DelLogModal/ComponentType';
import RecordModal from '@src/components/RecordModal/RecordModal';
import FetchRecord from '@src/schema/socket/FetchRecord';
import { withModeButton } from '@src/components/enhance';
import LogTable from './components/LogTable/LogTable';
import { helper } from '@src/utils/helper';
import './FetchLog.less';

const ModeButton = withModeButton()(Button);

const ExtendFetchLog = Form.create<Prop>({ name: 'SearchForm' })(
    /**
     * 采集日志
     */
    class FetchLog extends Component<Prop, State> {

        /**
         * 角色标志
         */
        isAdmin: boolean;

        constructor(props: any) {
            super(props);
            this.state = {
                delModalVisible: false,
                recordModalVisible: false,
                record: []
            };
            this.isAdmin = false;
        }
        componentDidMount() {

            const [, roleName] = this.props.location.search.split('=');
            this.isAdmin = roleName === 'admin';
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
         * 清除全部日志数据（自行维护使用）
         */
        dropAllDataHandle = () => {
            const { dispatch } = this.props;
            Modal.confirm({
                title: '日志将清除',
                content: '日志将会全部清除且不可恢复，确认吗？',
                okText: '确定',
                cancelText: '取消',
                onOk() {
                    dispatch({ type: 'fetchLog/dropAllData' });
                }
            });
        }
        /**
         * 删除id的记录
         */
        dropById = (id: string) => {
            const { dispatch } = this.props;
            Modal.confirm({
                title: '删除确认',
                content: '日志将删除，确认吗？',
                okText: '确定',
                cancelText: '取消',
                onOk() {
                    dispatch({ type: 'fetchLog/dropById', payload: id });
                }
            });
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
                        <ModeButton type="primary" onClick={this.searchFormSubmit}>
                            <Icon type={loading ? 'loading' : 'search'} />
                            <span>查询</span>
                        </ModeButton>
                    </Item>
                </Form>
                <div className="fn">
                    <ModeButton type="default" onClick={() => this.showDelModalChange(true)}>
                        <Icon type="delete" />
                        <span>清理</span>
                    </ModeButton>
                    <HiddenToggle show={this.isAdmin}>
                        <Button
                            type="danger"
                            onClick={() => this.dropAllDataHandle()}>
                            <Icon type="delete" />
                            <span>全部清除</span>
                        </Button>
                    </HiddenToggle>
                </div>
            </div>;
        }
        renderTable = (data: FetchLogEntity[], total: number): JSX.Element => {
            const { loading, current, pageSize } = this.props.fetchLog;
            return <LogTable
                loading={loading}
                current={current}
                pageSize={pageSize}
                total={total}
                data={data}
                context={this} />;
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