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
import { StoreData } from '@src/model/operation/FetchLogEdit/FetchLogEdit';
import { helper } from '@src/utils/helper';
import { Moment } from 'moment';
import ModifyLogModal from './components/ModifyLogModal/ModifyLogModal';
import './FetchLogEdit.less';

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库对象
     */
    fetchLogEdit: StoreData;
}
interface State {
    modifyLogModalVisible: boolean;
    editEntity?: CFetchLog;
}

const ExtendFetchLogEdit = Form.create<Prop>({ name: 'SearchForm' })(
    /**
     * 编辑采集日志
     */
    class FetchLogEdit extends Component<Prop, State> {
        constructor(props: any) {
            super(props);
            this.state = {
                modifyLogModalVisible: false
            };
        }
        componentDidMount() {
            this.queryTable();
        }
        /**
         * 查询表格数据
         */
        queryTable(condition: any = {}, current: number = 1, pageSize: number = 15) {
            const { dispatch } = this.props;
            dispatch({
                type: 'fetchLogEdit/queryAllFetchLog', payload: {
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
        modifyOkHandle = (data: any) => {
            const { dispatch } = this.props;
            dispatch({ type: 'fetchLogEdit/modifyTime', payload: data });
            this.setState({ modifyLogModalVisible: false });
        }
        modifyCancelHandle = () => {
            this.setState({ modifyLogModalVisible: false });
        }
        renderForm = () => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { loading } = this.props.fetchLogEdit;
            return <div className="search-bar">
                <Form layout="inline">
                    <Item label="结束时间 起">
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
            </div>;
        }
        renderTable = (data: CFetchLog[], total: number): JSX.Element => {
            const { dispatch } = this.props;
            const { loading, current, pageSize } = this.props.fetchLogEdit;
            return <Table<CFetchLog>
                columns={getColumns(dispatch, this)}
                dataSource={data}
                bordered={true}
                loading={loading}
                size="small"
                locale={{ emptyText: <Empty description="暂无数据" /> }}
                rowClassName={(record: CFetchLog, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
                pagination={{
                    total,
                    current,
                    pageSize,
                    onChange: this.pageChange
                }} />;
        }
        render(): JSX.Element {
            const { data, total } = this.props.fetchLogEdit;
            // console.log(editId);
            return <div className="fetch-log-edit-root">
                <div className="search-form">
                    {this.renderForm()}
                </div>
                <div className="scroll-panel">
                    <div className="table-panel">
                        {this.renderTable(data, total)}
                    </div>
                </div>
                <ModifyLogModal
                    visible={this.state.modifyLogModalVisible}
                    entity={this.state.editEntity}
                    okHandle={this.modifyOkHandle}
                    cancelHandle={this.modifyCancelHandle} />
            </div>
        }
    }
);

export default connect((state: any) => ({ fetchLogEdit: state.fetchLogEdit }))(ExtendFetchLogEdit);