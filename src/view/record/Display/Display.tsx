import path from 'path';
import { remote } from 'electron';
import { execFile } from 'child_process';
import React, { Component } from 'react';
import { connect } from 'dva';
import BcpModal from './components/BcpModal/BcpModal';
import Icon from 'antd/lib/icon';
import Table from 'antd/lib/table';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
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

const config = helper.getConfig();

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
    //案件路径（绝对路径）
    casePath: string;
    //当前详情手机名
    phoneName: string;
    //手机完整路径
    phonePath: string;
    //当前案件是否生成BCP
    bcp: number;
    //当前案件是否有附件
    attachment: number;

    constructor(props: IProp) {
        super(props);
        this.state = {
            showParsingModal: false,
            showBcpModal: false
        };
        this.caseName = '';
        this.casePath = '';
        this.phoneName = '';
        this.phonePath = '';
        this.bcp = -1;
        this.attachment = -1;
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
        let pos = data.PhonePath_!.lastIndexOf('\\');
        this.casePath = data.PhonePath_!.substring(0, pos);
        this.phonePath = data.PhonePath_!;
        Modal.confirm({
            title: '提示',
            content: '若要更改解析App，请在案件管理中进行编辑',
            icon: <Icon type="info-circle" style={{ color: '#1890ff' }} />,
            okText: '解析',
            cancelText: '取消',
            onOk() {
                dispatch({ type: 'display/startParsing', payload: data });
            }
        });

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
        let pos = data.PhonePath_!.lastIndexOf('\\');
        this.casePath = data.PhonePath_!.substring(0, pos);
        this.phonePath = data.PhonePath_!;
        this.bcp = data.nBcp_!;
        this.attachment = data.nContainAttach_!;
        this.setState({ showBcpModal: true });
    }
    /**
     * 生成BCP
     * @param data CBCPInfo对象
     * @param attachment 1有附件 0无附件
     * @param phonePath 手机绝对路径
     */
    okBcpModalHandle = (data: CBCPInfo, attachment: number, phonePath: string) => {
        const { dispatch } = this.props;
        const publishPath = remote.app.getAppPath();
        //报表应用路径
        const bcpExe = path.join(publishPath!, '../../../tools/BcpTools/BcpGen.exe');
        dispatch({
            type: 'bcpModal/saveBcp', payload: {
                phonePath: this.phonePath,
                data
            }
        });
        dispatch({ type: 'display/setRunning', payload: true });
        this.setState({ showBcpModal: false });
        //#运行生成BCP的可执行程序
        //#参数1：手机绝对路径 参数2：是否有附件0或1
        const process = execFile(bcpExe, [phonePath, attachment == 1 ? '1' : '0'], {
            windowsHide: false
        });
        //#只有当BCP进程结束了，才放开生成按钮
        process.once('close', () => {
            dispatch({ type: 'display/setRunning', payload: false });
        });
        process.once('exit', () => {
            dispatch({ type: 'display/setRunning', payload: false });
        });
    }
    cancelBcpModalHandle = () => {
        this.casePath = '';
        this.phonePath = '';
        this.bcp = -1;
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
            expandRowByClick={true}
            expandedRowRender={(record: Case) => {
                if (record.phone.length > 0) {
                    return <InnerPhoneList
                        data={record.phone}
                        isRunning={display.isRunning}
                        dispatch={dispatch}
                        parsingHandle={this.parsingHandle}
                        detailHandle={this.detailHandle}
                        bcpHandle={this.bcpHandle} />
                } else {
                    return <Empty description="无取证数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
                casePath={this.casePath}
                phonePath={this.phonePath}
                bcp={this.bcp}
                okHandle={this.okBcpModalHandle}
                cancelHandle={this.cancelBcpModalHandle} />
        </div>
    }
}

export default connect((state: any) => ({ display: state.display }))(Display);