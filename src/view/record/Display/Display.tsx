import React, { Component } from 'react';
import { connect } from 'dva';
import Table from 'antd/lib/table';
import Empty from 'antd/lib/empty';
import { StoreComponent } from '@type/model';
import { getColumns, Case } from './columns';
import InnerPhoneList from './components/InnerPhoneList/InnerPhoneList';
import { helper } from '@src/utils/helper';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import { StoreState } from '@src/model/record/Display/Display';
import ParsingStateModal from './components/ParsingStateModal/ParsingStateModal';
import debounce from 'lodash/debounce';
import './Display.less';

interface IProp extends StoreComponent {
    display: StoreState;
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
    //手机完整路径
    phonePath: string;

    constructor(props: IProp) {
        super(props);
        this.state = {
            showParsingModal: false
        };
        this.caseName = '';
        this.phoneName = '';
        this.phonePath = '';
        this.parsingHandle = debounce(this.parsingHandle, 500, {
            leading: true,
            trailing: false
        });
    }
    /**
     * 解析链接Click
     */
    parsingHandle = (data: UIRetOneInfo) => {
        const { dispatch } = this.props;
        dispatch({ type: 'display/startParsing', payload: data });
    }
    /**
     * 详情链接Click
     */
    detailHandle = (data: UIRetOneInfo) => {
        this.caseName = data.strCase_!;
        this.phoneName = data.strPhone_!;
        this.phonePath = data.PhonePath_!;
        this.setState({ showParsingModal: true });
    }
    /**
     * 解析详情框取消
     */
    parsingModalCancelHandle = () => {
        this.caseName = '';
        this.phoneName = '';
        this.phonePath = '';
        this.setState({ showParsingModal: false });
    }
    renderTable(): JSX.Element {
        const { dispatch, display } = this.props;
        return <Table<Case>
            columns={getColumns(dispatch)}
            dataSource={this.props.display.data}
            locale={{ emptyText: <Empty description="暂无数据" /> }}
            rowKey={helper.getKey()}
            bordered={true}
            pagination={{ pageSize: 10 }}
            loading={display.loading}
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
    /**
     * 根据手机路径取得详情消息
     */
    getDetailMessageByPhonepath(data: UIRetOneInfo[], clickPhonePath: string) {
        return data.find((item: UIRetOneInfo) => item.PhonePath_ === clickPhonePath);
    }
    render(): JSX.Element {
        const { source } = this.props.display;
        const detailPhone = this.getDetailMessageByPhonepath(source, this.phonePath);
        return <div className="display">
            <div className="scroll-panel">
                {this.renderTable()}
            </div>
            <ParsingStateModal
                visible={this.state.showParsingModal}
                caseName={this.caseName}
                phoneName={this.phoneName}
                message={detailPhone?.strdetails_!}
                status={detailPhone?.status_!}
                cancelHandle={() => this.parsingModalCancelHandle()} />
        </div>
    }
}

export default connect((state: any) => ({ display: state.display }))(Display);