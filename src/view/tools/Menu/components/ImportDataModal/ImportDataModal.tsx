import { remote, OpenDialogReturnValue } from 'electron';
import React, { Component, MouseEvent } from 'react';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Form, { FormComponentProps } from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import { StoreData } from '@src/model/tools/Menu/ImportDataModal';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import { helper } from '@src/utils/helper';
import { FormValue } from './FormValue';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import { CClientInfo } from '@src/schema/CClientInfo';
import { FetchTypeNameItem } from '@src/schema/FetchTypeNameItem';
import { CImportDataInfo } from '@src/schema/CImportDataInfo';
import debounce from 'lodash/debounce';

interface IProp extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 是否为加载状态
     */
    isLoading: boolean;
    dispatch?: Dispatch<any>;
    importDataModal?: StoreData;
    //保存回调
    saveHandle?: (arg0: CImportDataInfo) => void;
    //取消回调
    cancelHandle?: () => void;
}
interface IState {
    /**
     * 是否可见
     */
    caseInputVisible: boolean;
    /**
     * 所选案件是否生成BCP
     */
    isBcp: boolean;
    /**
     * 第三方数据路径
     */
    dataPath: string;
    /**
     * 是否为加载状态
     */
    isLoading: boolean;
}

const ProxyImportDataModal = Form.create<IProp>()(
    class ImportDataModal extends Component<IProp, IState>{
        //*保存选中检验员的名字
        officerSelectName: string;
        //*保存选中检验员的编号
        officerSelectID: string;
        //*保存选中检验单位的名字
        unitListName: string;
        //*选中的案件App列表
        appList: string[];
        //*选中的案件送检单位
        sendUnit: string;
        //*是否自动解析
        isAuto: boolean;
        constructor(props: IProp) {
            super(props);
            this.state = {
                caseInputVisible: false,
                isBcp: false,
                dataPath: '',
                isLoading: false
            };
            this.unitListSearch = debounce(this.unitListSearch, 812);
            this.officerSelectName = '';
            this.officerSelectID = '';
            this.unitListName = '';
            this.appList = [];
            this.sendUnit = '';
            this.isAuto = false;
        }
        componentDidMount() {
            const { dispatch } = this.props;
            dispatch!({ type: 'importDataModal/queryCaseList' });
            dispatch!({ type: 'importDataModal/queryOfficerList' });
            dispatch!({ type: 'importDataModal/queryUnit' });
            dispatch!({ type: 'importDataModal/queryCollectTypeData' });
        }
        componentWillReceiveProps(nextProp: IProp) {
            // const { dispatch } = this.props;
            this.setState({
                caseInputVisible: nextProp.visible,
                isLoading: nextProp.isLoading
            });
        }
        /**
         * 绑定案件下拉数据
         */
        bindCaseSelect() {
            const { caseList } = this.props.importDataModal!;
            const { Option } = Select;
            return caseList.map((opt: CCaseInfo) => {
                let pos = opt.m_strCaseName.lastIndexOf('\\');
                return <Option
                    value={opt.m_strCaseName.substring(pos + 1)}
                    data-bcp={opt.m_bIsGenerateBCP}
                    data-app-list={opt.m_Applist}
                    data-is-auto={opt.m_bIsAutoParse}
                    data-send-unit={opt.m_strDstCheckUnitName}
                    key={helper.getKey()}>
                    {opt.m_strCaseName.substring(pos + 1)}
                </Option>
            });
        }
        /**
         * 绑定检验员下拉
         */
        bindOfficerSelect() {
            // m_strCoronerName
            const { officerList } = this.props.importDataModal!;
            const { Option } = Select;
            return officerList.map((opt: CCheckerInfo) => {
                return <Option
                    value={opt.m_strUUID}
                    data-name={opt.m_strCheckerName}
                    data-id={opt.m_strCheckerID}
                    key={helper.getKey()}>
                    {opt.m_strCheckerID ? `${opt.m_strCheckerName}（${opt.m_strCheckerID}）` : opt.m_strCheckerName}
                </Option>
            });
        }
        /**
         * 绑定检验单位下拉
         */
        bindUnitSelect() {
            const { unitList } = this.props.importDataModal!;
            const { Option } = Select;
            return unitList.map((opt: CCheckOrganization) => {
                return <Option
                    value={opt.m_strCheckOrganizationID}
                    data-name={opt.m_strCheckOrganizationName}
                    key={helper.getKey()}>
                    {opt.m_strCheckOrganizationName}
                </Option>
            });
        }
        /**
         * 绑定采集方式下拉
         */
        bindCollectType() {
            const { Option } = Select;
            const { collectTypeList } = this.props.importDataModal!;
            if (collectTypeList && collectTypeList.length > 0) {
                return collectTypeList.map<JSX.Element>((item: FetchTypeNameItem) => {
                    return <Option
                        value={item.nFetchTypeID}
                        key={helper.getKey()}>
                        {item.m_strDes}
                    </Option>;
                });
            } else {
                return [];
            }
        }
        /**
         * 案件下拉Change
         */
        caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
            let isBcp = (option as JSX.Element).props['data-bcp'] as boolean;
            let appList = (option as JSX.Element).props['data-app-list'] as Array<string>;
            let isAuto = (option as JSX.Element).props['data-is-auto'] as boolean;
            let sendUnit = (option as JSX.Element).props['data-send-unit'] as string;
            const { setFieldsValue } = this.props.form;
            const { unitName } = this.props.importDataModal!;
            this.setState({ isBcp });
            this.appList = appList;
            this.isAuto = isAuto;
            this.sendUnit = sendUnit;
            if (isBcp) {
                setFieldsValue({
                    officerInput: '',
                    unitInput: unitName
                });
            } else {
                setFieldsValue({
                    officerSelect: null,
                    unitList: null
                });
            }
        }
        /**
         * 检验单位下拉Search事件
         */
        unitListSearch = (keyword: string) => {
            const { dispatch } = this.props;
            dispatch!({ type: 'importDataModal/queryUnitData', payload: keyword });
        }
        /**
         * 检验员下拉Change事件
         */
        officerSelectChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
            const { props } = (opt as JSX.Element);
            this.officerSelectName = props['data-name'];
            this.officerSelectID = props['data-id'];
        }
        /**
         * 检验单位下拉Change事件
         */
        unitListChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
            const { children } = (opt as JSX.Element).props;
            this.unitListName = children;
        }
        /**
         * 关闭框清空属性
         */
        resetFields() {
            this.officerSelectName = '';
            this.officerSelectID = '';
            this.unitListName = '';
            this.appList = [];
            this.sendUnit = '';
            this.isAuto = false;
        }
        selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
            const { setFieldsValue, resetFields } = this.props.form;
            remote.dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
                .then((val: OpenDialogReturnValue) => {
                    resetFields(['dataPath']);
                    if (val.filePaths && val.filePaths.length > 0) {
                        setFieldsValue({ casePath: val.filePaths[0] });
                        this.setState({ dataPath: val.filePaths[0] });
                    }
                });
        }
        /**
         * 表单提交
         */
        formSubmit = (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            const { validateFields } = this.props.form;
            const { isBcp } = this.state;
            validateFields((errors: any, values: FormValue) => {
                if (!errors) {
                    let indata = new CImportDataInfo();
                    indata.m_BaseInfo = new CFetchDataInfo(); //案件
                    indata.m_BaseInfo.m_strCaseName = values.case;
                    indata.m_BaseInfo.m_strDeviceName = `${values.name}_${helper.timestamp()}`;
                    indata.m_BaseInfo.m_strDeviceNumber = values.deviceNumber;
                    indata.m_BaseInfo.m_strDeviceHolder = values.user;
                    // indata.m_BaseInfo.m_bIsGenerateBCP = isBcp;
                    indata.m_BaseInfo.m_nFetchType = values.collectType;
                    // indata.m_BaseInfo.m_Applist = this.appList;
                    // indata.m_BaseInfo.m_bIsAutoParse = this.isAuto;
                    // indata.m_BaseInfo.m_ClientInfo = new CClientInfo();
                    // indata.m_BaseInfo.m_ClientInfo.m_strClientName = this.sendUnit; //送检单位
                    indata.m_strFileFolder = values.dataPath;
                    indata.m_strPhoneBrand = values.brand;
                    indata.m_strPhoneModel = values.piModel;
                    //todo: CFetchDataInfo结构有更新，将4个属性移动到了CBCPInfo结构中，待修改
                    // if (isBcp) {
                    //     //*生成BCP
                    //     indata.m_BaseInfo.m_strCheckerID = this.officerSelectID;
                    //     indata.m_BaseInfo.m_strCheckerName = this.officerSelectName;
                    //     indata.m_BaseInfo.m_strCheckOrganizationID = values.unitList;
                    //     indata.m_BaseInfo.m_strCheckOrganizationName = this.unitListName;
                    // } else {
                    //     //*不生成BCP
                    //     indata.m_BaseInfo.m_strCheckerName = values.officerInput;
                    //     indata.m_BaseInfo.m_strCheckOrganizationName = values.unitInput;
                    // }
                    this.props.saveHandle!(indata);
                }
            });
        }
        renderForm = (): JSX.Element => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { unitName, collectTypeList } = this.props.importDataModal!;
            const { isBcp } = this.state;
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 }
            };

            return <Form layout="horizontal" {...formItemLayout}>
                <Item label="数据位置">
                    {getFieldDecorator('dataPath', {
                        initialValue: this.state.dataPath,
                        rules: [{ required: true, message: '请选择第三方数据位置' }]
                    })(<Input
                        addonAfter={<Icon type="ellipsis" onClick={this.selectDirHandle} />}
                        readOnly={true}
                        placeholder="第三方数据所在位置"
                        onClick={this.selectDirHandle} />
                    )}
                </Item>
                <Item label="案件名称">
                    {getFieldDecorator('case', {
                        rules: [{
                            required: true,
                            message: '请选择案件'
                        }]
                    })(<Select
                        notFoundContent="暂无数据"
                        placeholder="选择一个案件"
                        onChange={this.caseChange}>
                        {this.bindCaseSelect()}
                    </Select>)}
                </Item>
                <Item label="检验员" style={{ display: isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('officerInput', {
                        rules: [{
                            required: !isBcp,
                            message: '请填写检验员'
                        }]
                    })(<Input placeholder="检验员姓名" />)}
                </Item>
                <Item label="检验单位" style={{ display: isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('unitInput', {
                        rules: [{
                            required: !isBcp,
                            message: '请填写检验单位'
                        }],
                        initialValue: unitName
                    })(<Input placeholder={"请填写检验单位"} />)}
                </Item>
                <Item label="检验员" style={{ display: !isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('officerSelect', {
                        rules: [{
                            required: isBcp,
                            message: '请选择检验员'
                        }]
                    })(<Select
                        notFoundContent="暂无数据"
                        placeholder="请选择一位检验员"
                        onChange={this.officerSelectChange}>
                        {this.bindOfficerSelect()}
                    </Select>)}
                </Item>
                <Item label="检验单位" style={{ display: !isBcp ? 'none' : 'block' }}>
                    {getFieldDecorator('unitList', {
                        rules: [{
                            required: isBcp,
                            message: '请选择检验单位'
                        }]
                    })(<Select
                        showSearch={true}
                        placeholder={"输入单位名称进行查询"}
                        defaultActiveFirstOption={false}
                        notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                        showArrow={false}
                        filterOption={false}
                        onSearch={this.unitListSearch}
                        onChange={this.unitListChange}>
                        {this.bindUnitSelect()}
                    </Select>)}
                </Item>
                <div style={{ display: 'flex' }}>
                    <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '请填写手机名称'
                                }]
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                    <Item label="手机持有人" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('user', {
                                rules: [{
                                    required: true,
                                    message: '请填写持有人'
                                }]
                            })(<Input placeholder="持有人姓名" maxLength={20} />)
                        }
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item label="手机品牌" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('brand', {
                                initialValue: ''
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                    <Item label="手机型号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('piModel', {
                                initialValue: ''
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item label="设备编号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('deviceNumber', {
                                initialValue: ''
                            })(<Input maxLength={20} />)
                        }
                    </Item>
                    <Item label="采集方式" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('collectType', {
                                initialValue: collectTypeList && collectTypeList.length > 0 ? collectTypeList[0].nFetchTypeID : ''
                            })(<Select
                                notFoundContent="暂无数据">
                                {this.bindCollectType()}
                            </Select>)
                        }
                    </Item>
                </div>
            </Form>
        }
        render(): JSX.Element {
            return <div className="case-input-modal">
                <Modal
                    width={800}
                    visible={this.state.caseInputVisible}
                    title="导入信息录入"
                    destroyOnClose={true}
                    onCancel={() => {
                        this.resetFields();
                        this.props.cancelHandle!();
                    }}
                    afterClose={() => this.setState({ dataPath: '' })}
                    footer={[
                        <Button
                            type="default"
                            icon="close-circle"
                            key={helper.getKey()}
                            onClick={() => this.props.cancelHandle!()}>
                            取消
                        </Button>,
                        <Button
                            type="primary"
                            icon={this.state.isLoading ? 'loading' : 'import'}
                            disabled={this.state.isLoading}
                            onClick={this.formSubmit}>
                            导入
                        </Button>
                    ]}>
                    <div>
                        {this.renderForm()}
                    </div>
                </Modal>
            </div>;
        }
    }
);

export default connect((state: any) => {
    return {
        importDataModal: state.importDataModal
    }
})(ProxyImportDataModal);