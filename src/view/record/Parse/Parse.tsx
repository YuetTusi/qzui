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
import { withModeButton } from '@src/components/ModeButton/modeButton';
import InnerPhoneTable from './components/InnerPhoneTable/InnerPhoneTable';
import { getColumns } from './columns';
import CCaseInfo from '@src/schema/CCaseInfo';
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { send } from '@src/service/tcpServer';
import './Parse.less';

const ModeButton = withModeButton()(Button);

interface Prop extends StoreComponent, FormComponentProps {
    parse: StoreModel;
}
interface State { }

/**
 * 解析列表
 */
const WrappedParse = Form.create<Prop>({ name: 'search' })(
    class Parse extends Component<Prop, State> {
        constructor(props: Prop) {
            super(props);
        }
        componentDidMount() {
            this.props.dispatch({ type: "parse/fetchCaseData", payload: { current: 1 } });
        }
        /**
         * 查询
         */
        searchSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            this.props.dispatch({ type: "parse/fetchCaseData", payload: { current: 1 } });
        }
        /**
         * 翻页Change
         */
        pageChange = (current: number, pageSize?: number) => {
            this.props.dispatch({
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
         * @param caseId  案件id
         * @param appIds App分类id
         * @param device 设备对象
         */
        startParseHandle = (caseId: string, appIds: string[], device: DeviceType) => {
            const { dispatch } = this.props;
            console.log(caseId);
            console.log(device.id);
            console.log(device.phonePath);
            console.log(appIds);
            send(SocketType.Parse, {
                type: SocketType.Parse,
                cmd: CommandType.StartParse,
                msg: {
                    caseId,
                    deviceId: device.id,
                    phonePath: device.phonePath,
                    app: appIds
                }
            });
            dispatch({
                type: 'parse/updateParseState', payload: {
                    id: device.id,
                    caseId,
                    parseState: ParseState.Parsing
                }
            });
        }
        /**
         * 渲染子表格
         */
        renderSubTable = ({ _id, m_Applist, devices }: CCaseInfo): JSX.Element | null => {
            let appIds = m_Applist.reduce((acc, current) => {
                (acc as string[]).push(current.m_strID);
                return acc;
            }, []);
            devices.sort((m, n) => moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1);
            return <InnerPhoneTable
                startParseHandle={this.startParseHandle}
                caseId={_id!}
                appIds={appIds}
                data={devices} />;
            return null;
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
            </div>;
        }
    }
);

export default connect((state: any) => ({ 'parse': state.parse }))(WrappedParse);