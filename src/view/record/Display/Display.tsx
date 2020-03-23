import React, { Component } from 'react';
import { connect } from 'dva';
import BcpModal from './components/BcpModal/BcpModal';
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
import { CBCPInfo } from '@src/schema/CBCPInfo';
import './Display.less';

interface IProp extends StoreComponent {
    display: StoreState;
}
interface IState {
    showParsingModal: boolean;
    showBcpModal: boolean;
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
            showParsingModal: false,
            showBcpModal: false
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
     * 生成BCP Click
     */
    bcpHandle = (data: UIRetOneInfo) => {
        this.phonePath = data.PhonePath_!;
        this.setState({ showBcpModal: true });
    }
    /**
     * 生成BCP
     */
    okBcpModalHandle = (data: CBCPInfo) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'bcpModal/saveBcp', payload: {
                phonePath: this.phonePath,
                data
            }
        });
        this.setState({ showBcpModal: false });
    }
    cancelBcpModalHandle = () => {
        this.setState({ showBcpModal: false });
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
                        detailHandle={this.detailHandle}
                        bcpHandle={this.bcpHandle} />
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
        let { showBcpModal, showParsingModal } = this.state;
        const detailPhone = this.getDetailMessageByPhonepath(source, this.phonePath);
        return <div className="display">
            <div className="scroll-panel">
                {this.renderTable()}
            </div>
            <ParsingStateModal
                visible={showParsingModal}
                caseName={this.caseName}
                phoneName={this.phoneName}
                message={detailPhone?.strdetails_!}
                status={detailPhone?.status_!}
                cancelHandle={() => this.parsingModalCancelHandle()} />
            <BcpModal
                visible={showBcpModal}
                phonePath={this.phonePath}
                okHandle={this.okBcpModalHandle}
                cancelHandle={this.cancelBcpModalHandle} />
            {/* <div style={{ position: 'absolute', zIndex: 100 }}>
                <button type="button" onClick={() => {
                    this.props.dispatch({ type: 'bcpModal/queryBcp', payload: 'E:\\TZTest\\有BCP_20200318095519\\M6 Note_20200319105629' });
                    this.setState({ showBcpModal: true });
                }}>OK</button>
            </div> */}
        </div>
    }
}

export default connect((state: any) => ({ display: state.display }))(Display);