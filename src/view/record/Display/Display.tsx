import React, { Component, ReactElement, MouseEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Input, Table, Empty } from 'antd';
import { IComponent, IObject } from '@type/model';
import Title from '@src/components/title/Title';
import './Display.less';
import { getColumns } from './columns';
import CCaseInfo from '@src/schema/CCaseInfo';

interface IProp extends IComponent {
    display: IObject;
}

/**
 * @description 数据解析首页
 */
class Display extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'display/fetchCaseData' });
    }
    render(): ReactElement {
        const { dispatch, display: { loading, caseData } } = this.props;
        return <div className="display">
            <Title>数据解析</Title>
            <div className="scroll-panel"> 
                <Table<CCaseInfo>
                    columns={getColumns(dispatch)}
                    dataSource={caseData}
                    locale={{ emptyText: <Empty description="暂无数据" /> }}
                    rowKey={(record: CCaseInfo) => record.m_strCaseName}
                    bordered={false}
                    pagination={{ pageSize: 10 }}
                    loading={loading} />
            </div>

        </div>
    }
}

export default connect((state: IObject) => ({ display: state.display }))(Display);