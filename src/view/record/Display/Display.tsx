import React, { Component } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { connect } from 'dva';
import Table from 'antd/lib/table';
import Empty from 'antd/lib/empty';
import { StoreComponent, IObject } from '@type/model';
import Title from '@src/components/title/Title';
import { getColumns } from './columns';
import CCaseInfo from '@src/schema/CCaseInfo';
import InnerPhoneList from './components/InnerPhoneList/InnerPhoneList';
import { helper } from '@src/utils/helper';
import './Display.less';

interface IProp extends StoreComponent {
    display: IObject;
}
interface IState {
    data: any;
}

/**
 * @description 数据解析首页
 */
class Display extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
        this.state = { data: null };
    }
    componentDidMount() {
        ipcRenderer.on('receive-parsing-detail', this.parsingDetailHandle);
    }
    componentWillUnmount() {
        ipcRenderer.removeListener('receive-parsing-detail', this.parsingDetailHandle);
    }
    parsingDetailHandle = (event: IpcRendererEvent, args: string) => {
        this.setState({ data: JSON.parse(args) });
    }
    render(): JSX.Element {
        const { dispatch } = this.props;
        return <div className="display">
            <Title>数据解析</Title>
            <div className="scroll-panel">
                <Table<CCaseInfo>
                    columns={getColumns<IState>(dispatch)}
                    dataSource={this.state.data}
                    locale={{ emptyText: <Empty description="暂无数据" /> }}
                    rowKey={helper.getKey()}
                    bordered={false}
                    pagination={{ pageSize: 10 }}
                    loading={this.state.data === null}
                    expandedRowRender={(record: any) => {
                        return <InnerPhoneList data={record.phoneList} />
                    }} />
            </div>

        </div>
    }
}

export default connect((state: IObject) => ({ display: state.display }))(Display);