import React, { Component } from 'react';
import { connect } from 'dva';
import Table from 'antd/lib/table';
import Empty from 'antd/lib/empty';
import { IComponent, IObject } from '@type/model';
import Title from '@src/components/title/Title';
import { getColumns } from './columns';
import CCaseInfo from '@src/schema/CCaseInfo';
import InnerPhoneList from './components/InnerPhoneList/InnerPhoneList';
import './Display.less';

interface IProp extends IComponent {
    display: IObject;
}

let timer: any = null;

/**
 * @description 数据解析首页
 */
class Display extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'display/fetchCaseData' });
    }
    render(): JSX.Element {
        const { dispatch, display: { loading, caseData } } = this.props;
        return <div className="display">
            <Title>数据解析</Title>
            <div className="scroll-panel">
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            timer = setInterval(() => dispatch({ type: 'display/fetchCaseData', payload: [] }), 2000);
                        }}>
                        启动
                </button>
                    <button type="button"
                        onClick={() => clearInterval(timer)}>
                        停止
                </button>
                </div>
                <Table<CCaseInfo>
                    columns={getColumns(dispatch)}
                    dataSource={caseData}
                    locale={{ emptyText: <Empty description="暂无数据" /> }}
                    rowKey={(record: CCaseInfo) => record.m_strCaseName}
                    bordered={false}
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                    expandedRowRender={(record: any) => {
                        return <InnerPhoneList data={record.phoneList} />
                    }} />
            </div>

        </div>
    }
}

export default connect((state: IObject) => ({ display: state.display }))(Display);