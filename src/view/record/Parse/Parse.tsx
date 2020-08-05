import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Form, { FormComponentProps } from 'antd/lib/form';
import Table from 'antd/lib/table';
import { StoreComponent } from '@src/type/model';
import { StoreModel } from '@src/model/record/Display/Parse';
import ProgressModal from './components/ProgressModal/ProgressModal';
import InnerPhoneTable from './components/InnerPhoneTable/InnerPhoneTable';
import { getColumns } from './columns';
import CCaseInfo from '@src/schema/CCaseInfo';
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { send } from '@src/service/tcpServer';
import './Parse.less';

interface Prop extends StoreComponent, FormComponentProps {
    parse: StoreModel;
}
interface State {
    progressModalVisible: boolean;
}

/**
 * 解析列表
 */
const WrappedParse = Form.create<Prop>({ name: 'search' })(
    class Parse extends Component<Prop, State> {

        /**
         * 正在查看详情的设备
         */
        progressDevice?: DeviceType

        constructor(props: Prop) {
            super(props);
            this.state = {
                progressModalVisible: false
            }
        }
        componentDidMount() {
            const { dispatch } = this.props;
            dispatch({ type: "parse/fetchCaseData", payload: { current: 1 } });
        }
        /**
         * 查询
         */
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            const { dispatch } = this.props;
            e.preventDefault();
            dispatch({ type: "parse/fetchCaseData", payload: { current: 1 } });
        }
        /**
         * 翻页Change
         */
        pageChange = (current: number, pageSize?: number) => {
            const { dispatch } = this.props;
            dispatch({
                type: "parse/fetchCaseData", payload: {
                    current,
                    pageSize
                }
            });
        }
        /**
         * 渲染查询表单
         */
        renderSearchForm(): JSX.Element {
            const { getFieldDecorator } = this.props.form;
            return (<div className="search-bar">
                <Form onSubmit={this.searchSubmit} layout="inline">
                    <Form.Item label="案件名称">
                        {getFieldDecorator('caseName')(<Input style={{ width: '300px' }} />)}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            <Icon type="search" />
                            <span>查询</span>
                        </Button>
                    </Form.Item>
                </Form>
            </div>);
        }
        /**
         * 开始解析
         * @param device 设备对象
         */
        startParseHandle = (device: DeviceType) => {
            const { dispatch } = this.props;
            console.log({
                caseId: device.caseId,
                deviceId: device.id,
                phonePath: device.phonePath
            });
            send(SocketType.Parse, {
                type: SocketType.Parse,
                cmd: CommandType.StartParse,
                msg: {
                    caseId: device.caseId,
                    deviceId: device.id,
                    phonePath: device.phonePath
                }
            });
            dispatch({
                type: 'parse/updateParseState', payload: {
                    id: device.id,
                    caseId: device.caseId,
                    parseState: ParseState.Parsing
                }
            });
        }
        /**
         * 查看解析详情Handle
         * @param device 设备对象
         */
        progressHandle = (device: DeviceType) => {
            this.progressDevice = device;
            this.setState({ progressModalVisible: true });
        }
        /**
         * 渲染子表格
         */
        renderSubTable = ({ _id, devices }: CCaseInfo): JSX.Element => {

            devices.sort((m, n) => moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1);
            return <InnerPhoneTable
                startParseHandle={this.startParseHandle}
                progressHandle={this.progressHandle}
                caseId={_id!}
                data={devices} />;
        }
        render(): JSX.Element {
            const { dispatch, parse: {
                loading, caseData,
                total, current, pageSize
            } } = this.props;
            return <div className="parse-root">
                <div className="scroll-panel">
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
                <ProgressModal
                    visible={this.state.progressModalVisible}
                    device={this.progressDevice!}
                    cancelHandle={() => {
                        this.progressDevice = undefined;
                        this.setState({ progressModalVisible: false });
                    }} />
            </div>;
        }
    }
);

export default connect((state: any) => ({ 'parse': state.parse }))(WrappedParse);