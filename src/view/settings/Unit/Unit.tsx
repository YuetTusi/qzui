import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Empty from 'antd/lib/empty';
import Form, { FormComponentProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Table, { PaginationConfig, TableRowSelection } from 'antd/lib/table';
import message from 'antd/lib/message';
import debounce from 'lodash/debounce';
import Title from '@src/components/title/Title';
import { StoreComponent } from '@src/type/model';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { getColumns } from './columns';
import './Unit.less';

interface IProp extends StoreComponent, FormComponentProps {
    //store
    unit: any;
}
interface IState {
    selectedRowKeys: string[] | number[];
    m_strCheckOrganizationName: string;
    m_strCheckOrganizationID: string;
}

let UnitExtend = Form.create<IProp>({ name: 'search' })(
    /**
     * 检验单位
     */
    class Unit extends Component<IProp, IState> {
        constructor(props: IProp) {
            super(props);
            this.state = {
                selectedRowKeys: [],
                m_strCheckOrganizationName: '',
                m_strCheckOrganizationID: ''
            };
            this.saveUnit = debounce(this.saveUnit, 1000, {
                leading: true,
                trailing: false
            });
        }
        componentDidMount() {
            this.queryCurrentUnit();
            this.queryUnitData('', 1);
        }
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const { getFieldsValue } = this.props.form;
            const { pcsName } = getFieldsValue();
            this.queryUnitData(pcsName, 1);
        }
        /**
         * 查询当前检验单位名
         */
        queryCurrentUnit() {
            const { dispatch } = this.props;
            dispatch({ type: 'unit/queryCurrentUnit' });
        }
        /**
         * 查询表格数据
         * @param keyword 关键字
         * @param pageIndex 页码（从1开始）
         */
        queryUnitData(keyword: string, pageIndex: number = 1) {
            const { dispatch } = this.props;
            this.setState({ selectedRowKeys: [] });
            dispatch({ type: 'unit/queryUnitData', payload: { keyword, pageIndex } });
        }
        /**
         * 保存检验单位
         */
        saveUnit() {
            if (this.state.selectedRowKeys.length !== 0) {
                this.props.dispatch({
                    type: 'unit/saveUnit', payload: {
                        m_strCheckOrganizationID: this.state.m_strCheckOrganizationID,
                        m_strCheckOrganizationName: this.state.m_strCheckOrganizationName
                    }
                });
            } else {
                message.info('请选择检验单位');
            }
        }
        /**
         * 确定Click事件
         */
        saveClick = () => {
            this.saveUnit();
        }
        /**
         * 渲染查询表单
         */
        renderSearchForm() {
            const { getFieldDecorator } = this.props.form;
            return <Form layout="inline" onSubmit={this.searchSubmit}>
                <Form.Item label="单位名称">
                    {getFieldDecorator('pcsName')(<Input />)}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        <Icon type="search" />
                        <span>查询</span></Button>
                </Form.Item>
            </Form>
        }
        rowSelectChange = (rowKeys: string[] | number[], selectRows: CCheckOrganization[]) => {
            this.setState({
                selectedRowKeys: rowKeys,
                m_strCheckOrganizationID: selectRows[0].m_strCheckOrganizationID!,
                m_strCheckOrganizationName: selectRows[0].m_strCheckOrganizationName!
            })
        }
        /**
         * 渲染表格
         */
        renderUnitTable = (): JSX.Element => {
            const { unitData, loading } = this.props.unit;
            const pagination: PaginationConfig = {
                current: this.props.unit.pageIndex,
                pageSize: this.props.unit.pageSize,
                total: this.props.unit.total,
                onChange: (pageIndex: number, pageSize: number | undefined) => {
                    let { pcsName } = this.props.form.getFieldsValue();
                    pcsName = pcsName || '';
                    this.setState({ selectedRowKeys: [] });
                    this.props.dispatch({
                        type: "unit/queryUnitData",
                        payload: { keyword: pcsName, pageIndex }
                    });
                }
            };

            return <Table<CCheckOrganization>
                columns={getColumns(this.props.dispatch)}
                dataSource={unitData}
                pagination={pagination}
                bordered={true}
                rowKey={(record: CCheckOrganization) => record.m_strCheckOrganizationID!}
                rowSelection={{
                    type: 'radio',
                    onChange: this.rowSelectChange,
                    selectedRowKeys: this.state.selectedRowKeys
                }}
                loading={loading}
                locale={{ emptyText: <Empty description="暂无数据" /> }}>
            </Table>;
        }
        render(): JSX.Element {
            const { currentUnit, currentUnitID } = this.props.unit;
            return <div className="unit-root">
                <div className="table-panel">
                    <div className="condition-bar">
                        <div className="info-bar">
                            <label>当前检验单位：</label>
                            <em title={currentUnitID ? `单位编号：${currentUnitID}` : ''}>{currentUnit ? currentUnit : '未设置'}</em>
                        </div>
                        {this.renderSearchForm()}
                    </div>
                    {this.renderUnitTable()}
                </div>
                <div className="fix-buttons">
                    <Button
                        type="primary"
                        icon="save"
                        onClick={() => this.saveClick()}>
                        确定
                    </Button>
                </div>
            </div>
        }
    }
);

export default connect((state: any) => ({ unit: state.unit }))(UnitExtend);