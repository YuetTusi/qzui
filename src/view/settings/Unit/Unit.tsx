import React, { Component, ReactElement, FormEvent } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Form, Icon, Empty, message } from 'antd';
import Title from '@src/components/title/Title';
import { IComponent, IObject } from '@src/type/model';
import { helper } from '@src/utils/helper';
import './Unit.less';
import { PaginationConfig, TableRowSelection } from 'antd/lib/table';

interface IProp extends IComponent {
    form: IObject;
    unit: IObject;
}

const columns = [
    {
        title: '检验单位',
        dataIndex: 'm_strName',
        key: 'm_strName'
    },
    {
        title: '单位编号',
        dataIndex: 'm_strID',
        key: 'm_strID'
    }
];

let UnitExtend = Form.create({ name: 'search' })(
    /**
     * 检验单位
     */
    class Unit extends Component<IProp> {
        //选中的单位Code
        selectUnitCode: string | null;
        constructor(props: IProp) {
            super(props);
            this.selectUnitCode = null;
        }
        componentDidMount() {
            this.queryUnitData('', 1);
        }
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const { getFieldsValue } = this.props.form;
            const { pcsName } = getFieldsValue();
            this.queryUnitData(pcsName, 1);
        }
        queryUnitData(keyword: string, pageIndex: number) {
            const { dispatch } = this.props;
            dispatch({ type: 'unit/queryUnitData', payload: { keyword, pageIndex: 1 } });
        }
        // pageChange(pageIndex: number, pageSize: number) {
        //     this.queryUnitData('', pageIndex);
        // }
        /**
         * 保存检验单位
         */
        saveClick = () => {
            if (this.selectUnitCode) {
                console.log(this.selectUnitCode);
            } else {
                message.info('请选择检验单位');
            }
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
        rowSelectChange = (rowKeys: any[], selectRows: any[]) => {
            this.selectUnitCode = rowKeys[0];
        }
        /**
         * 渲染表格
         */
        renderUnitTable = (): ReactElement => {
            const { unitData, loading } = this.props.unit;
            console.log(this.props.unit);
            const pagination: PaginationConfig = {
                current: this.props.unit.pageIndex,
                pageSize: this.props.unit.pageSize,
                total: this.props.unit.total,
                onChange: (pageIndex: number, pageSize: number | undefined) => {
                    // console.log(pageIndex);
                    // console.log(pageSize);
                    let { pcsName } = this.props.form.getFieldsValue();
                    pcsName = pcsName || '';
                    // console.log(pcsName);
                    this.props.dispatch({
                        type: "unit/queryUnitData",
                        payload: { keyword: pcsName, pageIndex }
                    });
                }
            };

            return <Table
                columns={columns}
                dataSource={unitData}
                pagination={pagination}
                rowKey={(record: IObject) => record.m_strID}
                rowSelection={{ type: 'radio', onChange: this.rowSelectChange }}
                loading={loading}
                locale={{ emptyText: <Empty description="暂无数据" /> }}>
            </Table>;
        }
        render(): ReactElement {
            return <div className="unit-root">
                <Title okText="确定" onOk={this.saveClick}>检验单位</Title>
                <div className="table-panel">
                    <div className="info-bar">
                        <label>当前检验单位：</label>
                        <em>abc</em>
                    </div>
                    <div className="condition-bar">
                        {this.renderSearchForm()}
                    </div>
                    {this.renderUnitTable()}
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ unit: state.unit }))(UnitExtend);