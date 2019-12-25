import React, { Component } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { connect } from 'dva';
import Table from 'antd/lib/table';
import Empty from 'antd/lib/empty';
import { StoreComponent, IObject } from '@type/model';
import Title from '@src/components/title/Title';
import { getColumns, Case } from './columns';
import InnerPhoneList from './components/InnerPhoneList/InnerPhoneList';
import { helper } from '@src/utils/helper';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import ParsingStateModal from './components/ParsingStateModal/ParsingStateModal';
import groupBy from 'lodash/groupBy';
import './Display.less';

interface IProp extends StoreComponent {
    display: IObject;
}
interface IState {
    showParsingModal: boolean;
}

/**
 * @description 数据解析首页
 */
class Display extends Component<IProp, IState> {
    //当前详情案件名
    caseName: string;
    //当前详情手机名
    phoneName: string;

    constructor(props: IProp) {
        super(props);
        this.state = {
            showParsingModal: false
        };
        this.caseName = '';
        this.phoneName = '';
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'display/fetchParsingList' });
    }
    /**
     * 主进程事件响应
     */
    receiveHandle = (event: IpcRendererEvent, args: string) => {
    }
    /**
     * 解析链接Click
     */
    parsingHandle = (data: UIRetOneInfo) => {
    }
    /**
     * 详情链接Click
     */
    detailHandle = (data: UIRetOneInfo) => {
        this.caseName = data.strCase_!;
        this.phoneName = data.strPhone_!;
        this.setState({ showParsingModal: true });
    }
    /**
     * 解析详情框取消
     */
    parsingModalCancelHandle = () => {
        this.caseName = '';
        this.phoneName = '';
        this.setState({ showParsingModal: false });
    }
    renderTable(): JSX.Element {
        const { dispatch } = this.props;
        return <Table<Case>
            columns={getColumns(dispatch)}
            dataSource={this.props.display.data}
            locale={{ emptyText: <Empty description="暂无数据" /> }}
            rowKey={helper.getKey()}
            bordered={false}
            pagination={{ pageSize: 10 }}
            expandedRowRender={(record: Case) => {
                if (record.phone.length > 0) {
                    return <InnerPhoneList
                        data={record.phone}
                        dispatch={dispatch}
                        parsingHandle={this.parsingHandle}
                        detailHandle={this.detailHandle} />
                } else {
                    return <Empty description="无手机数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            }} />
    }
    render(): JSX.Element {
        return <div className="display">
            <Title>数据解析</Title>
            <div className="scroll-panel">
                {this.renderTable()}
            </div>
            <ParsingStateModal
                visible={this.state.showParsingModal}
                caseName={this.caseName}
                phoneName={this.phoneName}
                cancelHandle={() => this.parsingModalCancelHandle()} />
        </div>
    }
}

export default connect((state: IObject) => ({ display: state.display }))(Display);