import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Table, { PaginationConfig } from 'antd/lib/table';
import message from 'antd/lib/message';
import { helper } from '@src/utils/helper';
import { StoreComponent } from '@src/type/model';
import { StoreData } from '@src/model/settings/DstUnit/DstUnit';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { getColumns } from './columns';
import './DstUnit.less';

const { max } = helper.readConf();

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库数据
     */
    dstUnit: StoreData;
}
interface State {
    /**
     * 选中行数据
     */
    selectedRowKeys: string[] | number[];
    /**
     * 单位名称
     */
    m_strCheckOrganizationName: string;
    /**
     * 单位id(编号)
     */
    m_strCheckOrganizationID: string;
}

let DstUnitExtend = Form.create<Prop>({ name: 'search' })(
    /**
     * 目的检验单位
     */
    class DstUnit extends Component<Prop, State> {
        constructor(props: Prop) {
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
            // this.queryCurrentDstUnit();
            // this.queryDstUnitData('', 1);
        }
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const { getFieldsValue } = this.props.form;
            const { pcsName } = getFieldsValue();
            this.queryDstUnitData(pcsName, 1);
        }
        /**
         * 查询当前目的检验单位名
         */
        queryCurrentDstUnit() {
            const { dispatch } = this.props;
            dispatch({ type: 'dstUnit/queryCurrentDstUnit' });
        }
        /**
         * 查询表格数据
         * @param keyword 关键字
         * @param pageIndex 页码（从1开始）
         */
        queryDstUnitData(keyword: string, pageIndex: number = 1) {
            const { dispatch } = this.props;
            this.setState({ selectedRowKeys: [] });
            dispatch({ type: 'dstUnit/queryDstUnitData', payload: { keyword, pageIndex } });
        }
        /**
         * 保存
         */
        saveUnit() {
            const { dispatch } = this.props;
            const {
                m_strCheckOrganizationID,
                m_strCheckOrganizationName,
                selectedRowKeys
            } = this.state;
            if (selectedRowKeys.length !== 0) {
                dispatch({
                    type: 'dstUnit/saveUnit', payload: {
                        m_strCheckOrganizationID,
                        m_strCheckOrganizationName
                    }
                });
            } else {
                message.info('请选择目的检验单位');
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
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            return <Form layout="inline" onSubmit={this.searchSubmit}>
                <Item label="单位名称">
                    {getFieldDecorator('pcsName')(<Input />)}
                </Item>
                <Item>
                    <Button type="primary" htmlType="submit">
                        <Icon type="search" />
                        <span>查询</span></Button>
                </Item>
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
            const { unitData, loading, pageIndex, pageSize, total } = this.props.dstUnit;
            const pagination: PaginationConfig = {
                current: pageIndex,
                pageSize,
                total,
                onChange: (pageIndex: number, pageSize: number | undefined) => {
                    let { pcsName } = this.props.form.getFieldsValue();
                    pcsName = pcsName || '';
                    this.setState({ selectedRowKeys: [] });
                    this.props.dispatch({
                        type: "dstUnit/queryDstUnitData",
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
            const { currentUnit, currentUnitID } = this.props.dstUnit;
            return <div className="dst-unit-root">
                <div className="table-panel">
                    <div className="condition-bar">
                        <div className="info-bar">
                            <label>当前目的检验单位：</label>
                            <em
                                className={classnames({ pad: max <= 2 })}
                                title={currentUnitID ? `单位编号：${currentUnitID}` : ''}>
                                {currentUnit ? currentUnit : '未设置'}
                            </em>
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

export default connect((state: any) => ({ dstUnit: state.dstUnit }))(DstUnitExtend);