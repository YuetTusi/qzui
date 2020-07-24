import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { Component, FormEvent } from 'react';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Table, { PaginationConfig } from 'antd/lib/table';
import message from 'antd/lib/message';
import { withModeButton } from '@src/components/ModeButton/modeButton';
import { helper } from '@utils/helper';
import localStore, { LocalStoreKey } from '@src/utils/localStore';
import { Prop, State, UnitRecord } from './componentType';
import { getColumns } from './columns';
import './Unit.less';

const max: number = helper.readConf().max;
const ModeButton = withModeButton()(Button);



let UnitExtend = Form.create<Prop>({ name: 'search' })(
    /**
     * 采集单位
     */
    class Unit extends Component<Prop, State> {

        /**
         * 用户选中的单位名
         */
        selectPcsCode: string | null;
        /**
         * 用户选中的单位编号
         */
        selectPcsName: string | null;

        constructor(props: Prop) {
            super(props);

            this.selectPcsCode = null;
            this.selectPcsName = null;

            this.state = {
                selectedRowKeys: [],
                currentPcsCode: null,
                currentPcsName: null,
                data: [],
                total: 0,
                current: 1,
                loading: false
            };
            this.saveUnit = debounce(this.saveUnit, 1000, {
                leading: true,
                trailing: false
            });
        }
        componentDidMount() {
            ipcRenderer.on('query-db-result', this.queryDbHandle);
            this.queryUnitData(null, 1);
            this.setState({
                currentPcsCode: localStore.get(LocalStoreKey.UnitCode),
                currentPcsName: localStore.get(LocalStoreKey.UnitName)
            });
        }
        componentWillUnmount() {
            ipcRenderer.removeListener('query-db-result', this.queryDbHandle);
        }
        /**
         * 查询结果Handle
         */
        queryDbHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
            if (result.success) {
                this.setState({
                    data: result.data.rows,
                    total: result.data.total
                })
            }
            this.setState({ loading: false });
        }
        /**
         * 查询Submit
         */
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            const { getFieldValue } = this.props.form;
            let keyword = getFieldValue('pcsName') || null;
            e.preventDefault();
            this.queryUnitData(keyword, 1);
        }
        /**
         * 查询表格数据
         * @param keyword 关键字
         * @param pageIndex 页码（从1开始）
         */
        queryUnitData(keyword: string | null, pageIndex: number = 1) {
            this.setState({ loading: true });
            ipcRenderer.send('query-db', keyword, pageIndex);
        }
        /**
         * 保存采集单位
         */
        saveUnit() {
            const { selectedRowKeys } = this.state
            if (selectedRowKeys.length !== 0) {
                localStore.set(LocalStoreKey.UnitName, this.selectPcsName);
                localStore.set(LocalStoreKey.UnitCode, this.selectPcsCode);
                message.destroy();
                message.success('保存成功');
                this.setState({
                    currentPcsCode: this.selectPcsCode,
                    currentPcsName: this.selectPcsName
                })
            } else {
                message.info('请选择采集单位');
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
                    <ModeButton type="primary" htmlType="submit">
                        <Icon type="search" />
                        <span>查询</span></ModeButton>
                </Item>
            </Form>
        }
        rowSelectChange = (selectedRowKeys: string[] | number[], selectedRows: UnitRecord[]) => {
            this.setState({ selectedRowKeys: selectedRowKeys });
            this.selectPcsCode = selectedRows[0].PcsCode;
            this.selectPcsName = selectedRows[0].PcsName;
        }
        /**
         * 渲染表格
         */
        renderUnitTable = (): JSX.Element => {
            // const { unitData, loading, pageIndex, pageSize, total } = this.props.unit;
            const { current, total, data, loading } = this.state;
            const pagination: PaginationConfig = {
                current,
                pageSize: 10,
                total,
                onChange: (pageIndex: number, pageSize: number | undefined) => {
                    let { pcsName } = this.props.form.getFieldsValue();
                    pcsName = pcsName || null;
                    this.setState({
                        selectedRowKeys: [],
                        current: pageIndex
                    });
                    this.queryUnitData(pcsName, pageIndex);
                }
            };

            return <Table<UnitRecord>
                columns={getColumns()}
                dataSource={data}
                pagination={pagination}
                bordered={true}
                rowKey={record => record.PcsCode}
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
            const { currentPcsCode, currentPcsName } = this.state;
            return <div className="unit-root">
                <div className="table-panel">
                    <div className="condition-bar">
                        <div className="info-bar">
                            <label>当前采集单位：</label>
                            <em
                                className={classnames({ pad: max <= 2 })}
                                title={currentPcsCode ? `单位编号：${currentPcsCode}` : ''}>
                                {currentPcsName ? currentPcsName : '未设置'}
                            </em>
                        </div>
                        {this.renderSearchForm()}
                    </div>
                    {this.renderUnitTable()}
                </div>
                <div className="fix-buttons">
                    <ModeButton
                        type="primary"
                        icon="save"
                        onClick={() => this.saveClick()}>
                        确定
                    </ModeButton>
                </div>
            </div>
        }
    }
);

export default UnitExtend;