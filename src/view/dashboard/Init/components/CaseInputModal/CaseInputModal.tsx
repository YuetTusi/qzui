import { remote, OpenDialogReturnValue } from 'electron';
import React, { Component, MouseEvent } from 'react';
import debounce from 'lodash/debounce';
import { Moment } from 'moment';
import { connect } from 'dva';
import { State, Prop } from './ComponentType';
import AutoComplete from 'antd/lib/auto-complete';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Icon from 'antd/lib/icon';
import Collapse from 'antd/lib/collapse';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Button from 'antd/lib/button';
import { helper } from '@src/utils/helper';
import { FormValue } from './ComponentType';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import FetchTypeNameItem from '@src/schema/FetchTypeNameItem';
import { confirmText } from './confirmText';
import { NVObject } from '@src/type/model';
import { certificateType } from '@src/schema/CertificateType';
import { sexCode } from '@src/schema/SexCode';
import { ethnicity } from '@src/schema/Ethnicity';
import { CBCPInfo } from '@src/schema/CBCPInfo';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import './CaseInputModal.less';

const ProxyCaseInputModal = Form.create<Prop>()(
    class CaseInputModal extends Component<Prop, State>{
        //*保存选中检验员的名字
        officerSelectName: string;
        //*保存选中检验员的编号
        officerSelectID: string;
        //*选中的案件App列表
        appList: string[];
        //*选中的案件送检单位
        sendUnit: string;
        //*是否自动解析
        isAuto: boolean;
        /**
         * 检验员姓名记录
         */
        historyCheckerNames: string[] = [];
        /**
         * 检验员编号记录
         */
        historyCheckerNo: string[] = [];
        /**
         * 手机名称记录
         */
        historyDeviceName: string[] = [];
        /**
         * 手机持有人记录
         */
        historyDeviceHolder: string[] = [];
        /**
         * 手机编号记录
         */
        historyDeviceNumber: string[] = [];

        constructor(props: Prop) {
            super(props);
            this.state = {
                caseInputVisible: false,
                isBcp: false,
                isOpenBcpPanel: false
            };
            this.selectDirHandle = debounce(this.selectDirHandle, 1000, { trailing: false, leading: true });
            this.officerSelectName = '';
            this.officerSelectID = '';
            this.appList = [];
            this.sendUnit = '';
            this.isAuto = false;
        }
        componentDidMount() {
            const { dispatch } = this.props;
            this.historyCheckerNames = UserHistory.get(HistoryKeys.HISTORY_CHECKERNAME);
            this.historyCheckerNo = UserHistory.get(HistoryKeys.HISTORY_CHECKERNO);
            this.historyDeviceName = UserHistory.get(HistoryKeys.HISTORY_DEVICENAME);
            this.historyDeviceHolder = UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER);
            this.historyDeviceNumber = UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER);
            dispatch!({ type: 'caseInputModal/queryCaseList' });
            dispatch!({ type: 'caseInputModal/queryOfficerList' });
            dispatch!({ type: 'caseInputModal/queryUnit' });
            dispatch!({ type: 'caseInputModal/queryDstUnit' });
        }
        componentWillReceiveProps(nextProp: Prop) {
            const { dispatch } = this.props;
            this.setState({ caseInputVisible: nextProp.visible });
            if (nextProp.visible !== this.props.visible) {
                this.historyCheckerNames = UserHistory.get(HistoryKeys.HISTORY_CHECKERNAME);
                this.historyCheckerNo = UserHistory.get(HistoryKeys.HISTORY_CHECKERNO);
                this.historyDeviceName = UserHistory.get(HistoryKeys.HISTORY_DEVICENAME);
                this.historyDeviceHolder = UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER);
                this.historyDeviceNumber = UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER);
                //查询采集方式下拉数据
                // dispatch!({
                //     type: 'caseInputModal/queryCollectTypeData', payload: {
                //         piSerialNumber: nextProp.piSerialNumber,
                //         piLocationID: nextProp.piLocationID
                //     }
                // });
            }
        }
        /**
         * 绑定案件下拉数据
         */
        bindCaseSelect() {
            const { caseList } = this.props.caseInputModal!;
            const { Option } = Select;
            return caseList.map((opt: CCaseInfo) => {
                let pos = opt.m_strCaseName.lastIndexOf('\\');
                let [name, tick] = opt.m_strCaseName.substring(pos + 1).split('_');
                return <Option
                    value={opt.m_strCaseName.substring(pos + 1)}
                    data-bcp={opt.m_bIsGenerateBCP}
                    data-app-list={opt.m_Applist}
                    data-is-auto={opt.m_bIsAutoParse}
                    data-send-unit={opt.m_strDstCheckUnitName}
                    key={helper.getKey()}>
                    {`${name}（${helper.parseDate(tick, 'YYYYMMDDHHmmss').format('YYYY-M-D H:mm:ss')}）`}
                </Option>
            });
        }
        /**
         * 绑定检验员下拉
         */
        bindOfficerSelect() {
            const { officerList } = this.props.caseInputModal!;
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
         * 绑定采集方式下拉
         */
        bindCollectType() {
            const { Option } = Select;
            const { collectTypeList } = this.props.caseInputModal!;
            if (collectTypeList && collectTypeList.length > 0) {
                return collectTypeList.map((item: FetchTypeNameItem) => {
                    return <Option
                        data-des={item.m_strDes}
                        data-id={item.nFetchTypeID}
                        data-name={item.strFetchTypeName}
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
            const { setFieldsValue, validateFields } = this.props.form;
            this.appList = appList;
            this.isAuto = isAuto;
            this.sendUnit = sendUnit;
            //# 当用户切换了案件，强制较验相关字段 
            this.setState({
                isBcp,
                isOpenBcpPanel: isBcp
            }, () => validateFields([
                'm_strThirdCheckerName', 'officerSelect',
                'phoneName', 'user'],
                { force: true }));
            if (isBcp) {
                setFieldsValue({
                    officerInput: ''
                });
            } else {
                setFieldsValue({
                    officerSelect: null
                });
            }
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
        * 将JSON数据转为Options元素
        * @param data JSON数据
        */
        getOptions = (data: NVObject[]): JSX.Element[] => {
            const { Option } = Select;
            return data.map<JSX.Element>((item: NVObject) =>
                <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
        }
        /**
         * 选择头像路径Handle
         */
        selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
            const { setFieldsValue } = this.props.form;
            remote.dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
                ]
            }).then((val: OpenDialogReturnValue) => {
                if (val.filePaths && val.filePaths.length > 0) {
                    setFieldsValue({ UserPhoto: val.filePaths[0] });
                }
            });
        }
        /**
         * 折叠面板Change
         */
        collapseChange = (key: string | string[]) => {
            this.setState({ isOpenBcpPanel: !this.state.isOpenBcpPanel });
        }
        /**
         * 关闭框清空属性
         */
        resetFields() {
            this.officerSelectName = '';
            this.officerSelectID = '';
            this.appList = [];
            this.sendUnit = '';
            this.isAuto = false;
            this.setState({
                isBcp: false,
                isOpenBcpPanel: false
            });
        }
        /**
         * 表单提交
         */
        formSubmit = (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            const { validateFields } = this.props.form;
            const { isBcp } = this.state;
            const {
                // piSerialNumber,
                // piLocationID,
                piUserlist,
                saveHandle
            } = this.props;
            const { unitName, unitCode, dstUnitName, dstUnitCode } = this.props.caseInputModal!;
            validateFields((errors: any, values: FormValue) => {
                if (!errors) {
                    let caseEntity = new CFetchDataInfo();//案件
                    caseEntity.m_strCaseName = values.case;
                    // caseEntity.m_strThirdCheckerID = values.m_strThirdCheckerID;
                    // caseEntity.m_strThirdCheckerName = values.m_strThirdCheckerName;
                    // caseEntity.m_strDeviceID = piSerialNumber + piLocationID;
                    caseEntity.m_strDeviceName = `${values.user}-${values.phoneName}_${helper.timestamp()}`;
                    caseEntity.m_strDeviceNumber = values.deviceNumber;
                    caseEntity.m_strDeviceHolder = values.user;
                    caseEntity.m_nFetchType = values.collectType;

                    let bcpEntity = new CBCPInfo();
                    if (isBcp) {
                        //*生成BCP
                        bcpEntity.m_strCheckerID = this.officerSelectID;
                        bcpEntity.m_strCheckerName = this.officerSelectName;
                        bcpEntity.m_strCheckOrganizationID = unitCode!;
                        bcpEntity.m_strCheckOrganizationName = unitName!;
                        bcpEntity.m_strDstOrganizationID = dstUnitCode!;
                        bcpEntity.m_strDstOrganizationName = dstUnitName!;
                    } else {
                        //*不生成BCP
                        bcpEntity.m_strCheckerID = '';
                        bcpEntity.m_strCheckerName = values.officerInput;
                        bcpEntity.m_strCheckOrganizationID = '';
                        bcpEntity.m_strCheckOrganizationName = unitName!;
                        bcpEntity.m_strDstOrganizationID = '';
                        bcpEntity.m_strDstOrganizationName = dstUnitName!;
                    }
                    bcpEntity.m_strCertificateType = values.CertificateType;
                    bcpEntity.m_strCertificateCode = values.CertificateCode;
                    bcpEntity.m_strCertificateIssueUnit = values.CertificateIssueUnit;
                    bcpEntity.m_strCertificateEffectDate = helper.isNullOrUndefined(values.CertificateEffectDate) ? '' : values.CertificateEffectDate.format('YYYY-MM-DD');
                    bcpEntity.m_strCertificateInvalidDate = helper.isNullOrUndefined(values.CertificateInvalidDate) ? '' : values.CertificateInvalidDate.format('YYYY-MM-DD');
                    bcpEntity.m_strSexCode = values.SexCode;
                    bcpEntity.m_strNation = values.Nation;
                    bcpEntity.m_strBirthday = helper.isNullOrUndefined(values.Birthday) ? '' : values.Birthday.format('YYYY-MM-DD');
                    bcpEntity.m_strAddress = values.Address;
                    bcpEntity.m_strUserPhoto = values.UserPhoto;
                    // caseEntity.m_BCPInfo = bcpEntity;

                    if (caseEntity.m_nFetchType === AppDataExtractType.ANDROID_DOWNGRADE_BACKUP) {
                        //# 采集方式为`降级备份`给用户弹提示
                        Modal.confirm({
                            title: '风险警示',
                            content: '降级备份可能造成数据损坏，确认使用？',
                            okText: '继续',
                            cancelText: '取消',
                            iconType: 'warning',
                            onOk() {
                                saveHandle!(caseEntity);
                            }
                        });
                    } else if (piUserlist && piUserlist.length === 1) {
                        //# 如果采集的设备有`多用户`或`隐私空间`等情况，要给用户弹出提示
                        Modal.confirm({
                            title: '请确认',
                            content: confirmText(piUserlist[0]),
                            okText: '开始取证',
                            cancelText: '取消',
                            onOk() {
                                saveHandle!(caseEntity);
                            }
                        });
                    } else if (piUserlist && piUserlist.length === 2) {
                        Modal.confirm({
                            title: '请确认',
                            content: confirmText(-1),
                            okText: '开始取证',
                            cancelText: '取消',
                            onOk() {
                                saveHandle!(caseEntity);
                            }
                        });
                    } else {
                        saveHandle!(caseEntity);
                    }
                }
            });
        }
        renderForm = (): JSX.Element => {
            const { Item } = Form;
            const { Panel } = Collapse;
            const { getFieldDecorator } = this.props.form;
            const { collectTypeList } = this.props.caseInputModal!;
            const { isBcp } = this.state;
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 }
            };

            return <div>
                <Form layout="horizontal" {...formItemLayout}>
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
                    <div style={{ display: 'flex' }}>
                        <Item label="检验员" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                            {getFieldDecorator('m_strThirdCheckerName', {
                                rules: [{ required: true, message: '请填写检验员' }]
                            })(<AutoComplete dataSource={this.historyCheckerNames.reduce((total: string[], current: string, index: number) => {
                                if (index < 10 && current !== null) {
                                    total.push(current);
                                }
                                return total;
                            }, [])} />)}
                        </Item>
                        <Item label="检验员编号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                            {getFieldDecorator('m_strThirdCheckerID')(<AutoComplete
                                dataSource={this.historyCheckerNo.reduce((total: string[], current: string, index: number) => {
                                    if (index < 10 && current !== null) {
                                        total.push(current);
                                    }
                                    return total;
                                }, [])} />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                            {
                                getFieldDecorator('phoneName', {
                                    rules: [{
                                        required: true,
                                        message: '请填写手机名称'
                                    }],
                                    initialValue: this.props.piModel,
                                })(<AutoComplete
                                    dataSource={this.historyDeviceName.reduce((total: string[], current: string, index: number) => {
                                        if (index < 10 && current !== null) {
                                            total.push(current);
                                        }
                                        return total;
                                    }, [])} />)
                            }
                        </Item>
                        <Item label="手机持有人" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                            {
                                getFieldDecorator('user', {
                                    rules: [{
                                        required: true,
                                        message: '请填写持有人'
                                    }]
                                })(<AutoComplete
                                    dataSource={this.historyDeviceHolder.reduce((total: string[], current: string, index: number) => {
                                        if (index < 10 && current !== null) {
                                            total.push(current);
                                        }
                                        return total;
                                    }, [])} />)
                            }
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item label="手机编号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                            {
                                getFieldDecorator('deviceNumber')(<AutoComplete
                                    dataSource={this.historyDeviceNumber.reduce((total: string[], current: string, index: number) => {
                                        if (index < 10 && current !== null) {
                                            total.push(current);
                                        }
                                        return total;
                                    }, [])} />)
                            }
                        </Item>
                        <Item label="采集方式" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                            {
                                getFieldDecorator('collectType', {
                                    initialValue: collectTypeList && collectTypeList.length > 0 ? collectTypeList[0].nFetchTypeID : ''
                                })(<Select notFoundContent="暂无数据">
                                    {this.bindCollectType()}
                                </Select>)
                            }
                        </Item>
                    </div>
                    {/*暂时不用动态展开面板  activeKey={this.state.isOpenBcpPanel ? '1' : '0'} */}
                    <Collapse activeKey={this.state.isOpenBcpPanel ? '1' : '0'} onChange={this.collapseChange}>
                        <Panel header="BCP采集信息录入" key="1">

                            <div style={{ display: 'flex' }}>
                                <Tooltip title="采集单位民警编号">
                                    <Item label="采集人员" style={{ display: isBcp ? 'none' : 'flex', flex: 1 }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                                        {getFieldDecorator('officerInput', {
                                            rules: [{
                                                required: false,
                                                message: '请填写采集人员'
                                            }]
                                        })(<Input />)}
                                    </Item>
                                </Tooltip>
                                <Item label="采集人员" style={{ display: !isBcp ? 'none' : 'flex', flex: 1 }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                                    {getFieldDecorator('officerSelect', {
                                        rules: [{
                                            required: isBcp,
                                            message: '请选择采集人员'
                                        }]
                                    })(<Select
                                        notFoundContent="暂无数据"
                                        placeholder="请选择一位采集人员"
                                        onChange={this.officerSelectChange}>
                                        {this.bindOfficerSelect()}
                                    </Select>)}
                                </Item>
                                <Item
                                    label="出生日期"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('Birthday', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '请填写出生日期'
                                            }
                                        ]
                                    })(<DatePicker
                                        style={{ width: '100%' }}
                                        disabledDate={(currentDate: Moment | null) => helper.isAfter(currentDate!)}
                                        locale={locale} />)}
                                </Item>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <Item
                                    label="证件类型"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('CertificateType', {
                                        rules: [
                                            { required: false }
                                        ],
                                        initialValue: '111'
                                    })(<Select>
                                        {this.getOptions(certificateType)}
                                    </Select>)}
                                </Item>
                                <Item
                                    label="证件编号"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('CertificateCode', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '请填写证件编号'
                                            }
                                        ]
                                    })(<Input />)}
                                </Item>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <Item
                                    label="证件生效日期"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('CertificateEffectDate', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '请填写证件生效日期'
                                            }
                                        ]
                                    })(<DatePicker
                                        style={{ width: '100%' }}
                                        locale={locale} />)}
                                </Item>
                                <Item
                                    label="证件失效日期"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('CertificateInvalidDate', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '请填写证件失效日期'
                                            }
                                        ]
                                    })(<DatePicker
                                        style={{ width: '100%' }}
                                        locale={locale} />)}
                                </Item>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <Item
                                    label="证件签发机关"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('CertificateIssueUnit', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '请填写证件签发机关'
                                            }
                                        ]
                                    })(<Input />)}
                                </Item>
                                <Item
                                    label="性别"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('SexCode', {
                                        rules: [
                                            { required: false }
                                        ],
                                        initialValue: '0'
                                    })(<Select>
                                        {this.getOptions(sexCode)}
                                    </Select>)}
                                </Item>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <Item
                                    label="民族"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('Nation', {
                                        rules: [
                                            { required: false }
                                        ],
                                        initialValue: '1'
                                    })(<Select>
                                        {this.getOptions(ethnicity)}
                                    </Select>)}
                                </Item>
                                <Item
                                    label="证件头像"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 12 }}
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('UserPhoto', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '请选择证件头像'
                                            }
                                        ]
                                    })(<Input
                                        addonAfter={<Icon type="ellipsis" onClick={this.selectDirHandle} />}
                                        readOnly={true}
                                        onClick={this.selectDirHandle} />)}
                                </Item>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <Item
                                    label="住址"
                                    style={{ flex: 1 }}>
                                    {getFieldDecorator('Address', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '请填写住址'
                                            }
                                        ]
                                    })(<Input />)}
                                </Item>
                            </div>
                        </Panel>
                    </Collapse>
                </Form>
            </div>;
        }
        render(): JSX.Element {
            return <div className="case-input-modal-root">
                <Modal
                    width={1200}
                    style={{ top: 20 }}
                    visible={this.state.caseInputVisible}
                    title="取证信息录入"
                    destroyOnClose={true}
                    className="modal-style-update"
                    onCancel={() => {
                        this.resetFields();
                        this.props.cancelHandle!();
                    }}
                    footer={[
                        <Button
                            type="default"
                            icon="close-circle"
                            key={helper.getKey()}
                            onClick={() => {
                                this.resetFields();
                                this.props.cancelHandle!();
                            }}>
                            取消
                        </Button>,
                        <Tooltip title="点击确定后开始采集数据" key={helper.getKey()}>
                            <Button
                                type="primary"
                                icon="check-circle"
                                onClick={this.formSubmit}>
                                确定
                            </Button>
                        </Tooltip>
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
        caseInputModal: state.caseInputModal
    }
})(ProxyCaseInputModal);