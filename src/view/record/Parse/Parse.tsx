import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import Empty from 'antd/lib/empty';
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
    /**
     * 显示进度框
     */
    progressModalVisible: boolean;
    /**
     * 展开的rowKeys
     */
    expendRowKeys: string[] | number[];
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
                progressModalVisible: false,
                expendRowKeys: []
            }
        }
        componentDidMount() {
            const { dispatch } = this.props;
            const [, cid] = this.props.location.search.split('=');
            if (cid) {
                this.setState({ expendRowKeys: [cid] })
            }
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
         * 开始解析
         * @param device 设备对象
         */
        startParseHandle = (device: DeviceType) => {
            const { dispatch } = this.props;
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
         * 删除手机数据
         */
        delHandle = (data: DeviceType) => {
            const { dispatch } = this.props;
            dispatch({
                type: 'parse/deleteDevice', payload: {
                    caseId: data.caseId,
                    data
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
        toBcpHandle = (device: DeviceType) => {
            const { dispatch } = this.props;
            dispatch(routerRedux.push(`/record/bcp/${device.caseId}/${device.id}`));
        }
        onExpandedRowsChange = (rowKeys: string[] | number[]) => {
            this.setState({ expendRowKeys: rowKeys });
        }
        /**
         * 渲染子表格
         */
        renderSubTable = ({ _id, devices }: CCaseInfo): JSX.Element => {

            devices.sort((m, n) => moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1);
            return <InnerPhoneTable
                startParseHandle={this.startParseHandle}
                progressHandle={this.progressHandle}
                toBcpHandle={this.toBcpHandle}
                delHandle={this.delHandle}
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
                        expandedRowKeys={this.state.expendRowKeys}
                        onExpandedRowsChange={this.onExpandedRowsChange}
                        expandRowByClick={true}
                        dataSource={caseData}
                        locale={{ emptyText: <Empty description="暂无数据" /> }}
                        rowKey={(record: CCaseInfo) => record._id!}
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