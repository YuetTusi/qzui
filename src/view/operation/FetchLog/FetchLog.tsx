import React, { Component } from 'react';
import { connect } from 'dva';
import Table from 'antd/lib/table';
import Db from '@utils/Db';
import CFetchLog from '@src/schema/CFetchLog';
import './FetchLog.less';
import Input from 'antd/lib/input';
import { getColumns } from './columns';
import { StoreComponent } from '@src/type/model';
import { StoreData } from '@src/model/operation/FetchLog/FetchLog';

interface Prop extends StoreComponent {
    /**
     * 仓库对象
     */
    fetchLog: StoreData;
}
interface State {
}

/**
 * 采集日志
 */
class FetchLog extends Component<Prop, State> {
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'fetchLog/queryAllFetchLog' });
    }
    renderTable = (data: CFetchLog[]): JSX.Element => {
        const { dispatch } = this.props;
        return <Table<CFetchLog>
            columns={getColumns(dispatch)}
            dataSource={data}
            bordered={true}
            size="small" />;
    }
    render(): JSX.Element {
        const { data } = this.props.fetchLog;
        return <div className="fetch-log-root">
            <div className="search-form">
                <Input />
            </div>
            <div className="table-panel">
                {this.renderTable(data)}
            </div>
        </div>
    }
}
export default connect((state: any) => ({ fetchLog: state.fetchLog }))(FetchLog);