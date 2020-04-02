import { remote, OpenDialogReturnValue } from 'electron';
import React, { Component, ReactElement, MouseEvent } from 'react';
import { Moment } from 'moment';
import { connect } from 'dva';
import { NVObject } from '@src/type/model';
import { Prop, State, FormValue } from './ComponentType';
import DatePicker from 'antd/lib/date-picker'
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { helper } from '@src/utils/helper';
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';
import { certificateType } from '@src/schema/CertificateType';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { CBCPInfo } from '@src/schema/CBCPInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import './BcpModal.less';

/**
 * BCP信息录入框
 */
const ExtendBcpModal = Form.create<Prop>({ name: 'BcpForm' })(
    class BcpModal extends Component<Prop, State> {
        /**
         * 检验员的名字
         */
        officerSelectName: string;
        /**
         * 检验员的编号
         */
        officerSelectID: string;
        /**
         * 保存选中检验单位编号
         */
        unitListID: string;
        /**
         * 保存选中检验单位名字
         */
        unitListName: string;
        /**
         * 目的检验单位编号
         */
        dstUnitNo: string;
        /**
         * 目的检验单位名称
         */
        dstUnitName: string;
        /**
         * 用户通过输入查询过BCP单位
         */
        unitSearched: boolean;

        constructor(props: Prop) {
            super(props);
            this.state = {
                visible: false,
                casePath: '',
                phonePath: '',
                // bcp: -1
            }
            this.officerSelectID = '';
            this.officerSelectName = '';
            this.unitListID = '';
            this.unitListName = '';
            this.dstUnitNo = '';
            this.dstUnitName = '';
            this.unitSearched = false;
        }
        componentDidMount() {
            const { dispatch } = this.props;
            dispatch({ type: 'bcpModal/queryOfficerList' });
        }
        componentWillReceiveProps(nextProp: Prop, nextState: State) {
            const { dispatch, phonePath } = this.props;
            if (this.state.visible !== nextProp.visible || phonePath !== nextProp.phonePath) {
                dispatch({ type: 'bcpModal/queryCase', payload: nextProp.casePath });
                dispatch({ type: 'bcpModal/queryBcp', payload: nextProp.phonePath });
            }
            this.setState({
                visible: nextProp.visible,
                casePath: nextProp.casePath,
                phonePath: nextProp.phonePath
                // bcp: nextProp.bcp
            });
        }
        /**
         * 将JSON数据转为Options元素
         * @param data JSON数据
         */
        getOptions = (data: NVObject[]): JSX.Element[] => {
            const { Option } = Select;
            return data.map<JSX.Element>(({ name, value }: NVObject) =>
                <Option value={value} key={helper.getKey()}>{name}</Option>);
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
         * 生成BCP按钮Click
         */
        generateBcpClick = () => {
            const { validateFields } = this.props.form;
            const { bcpInfo } = this.props.bcpModal;
            validateFields((errors: any, values: FormValue) => {
                if (helper.isNullOrUndefined(errors)) {
                    let entity: CBCPInfo = {
                        ...bcpInfo
                    }
                    // if (this.state.bcp === 1) {
                    //     //#生成BCP
                    //     entity.m_strCheckerID = this.officerSelectID;
                    //     entity.m_strCheckerName = this.officerSelectName;
                    //     entity.m_strCheckOrganizationID = this.unitListID;
                    //     entity.m_strCheckOrganizationName = this.unitListName;
                    //     entity.m_strDstOrganizationID = this.dstUnitNo;
                    //     entity.m_strDstOrganizationName = this.dstUnitName;
                    // } else {
                    //     //#不生成BCP
                    //     entity.m_strCheckerID = '';
                    //     entity.m_strCheckerName = values.officerInput;
                    //     entity.m_strCheckOrganizationID = '';
                    //     entity.m_strCheckOrganizationName = values.unitInput;
                    //     entity.m_strDstOrganizationID = '';
                    //     entity.m_strDstOrganizationName = values.dstUnitInput;
                    // }
                    entity.m_strCheckerID = this.officerSelectID;
                    entity.m_strCheckerName = this.officerSelectName;
                    entity.m_strCheckOrganizationID = this.unitListID;
                    entity.m_strCheckOrganizationName = this.unitListName;
                    entity.m_strDstOrganizationID = this.dstUnitNo;
                    entity.m_strDstOrganizationName = this.dstUnitName;

                    entity.m_strAddress = values.Address;
                    entity.m_strBirthday = helper.isNullOrUndefinedOrEmptyString(values.Birthday) ? '' : values.Birthday.format('YYYY-MM-DD');
                    entity.m_strCertificateCode = values.CertificateCode;
                    entity.m_strCertificateEffectDate = helper.isNullOrUndefinedOrEmptyString(values.CertificateEffectDate) ? '' : values.CertificateEffectDate.format('YYYY-MM-DD');
                    entity.m_strCertificateInvalidDate = helper.isNullOrUndefinedOrEmptyString(values.CertificateInvalidDate) ? '' : values.CertificateInvalidDate.format('YYYY-MM-DD');
                    entity.m_strCertificateIssueUnit = values.CertificateIssueUnit;
                    entity.m_strCertificateType = values.CertificateType;
                    entity.m_strNation = values.Nation;
                    entity.m_strSexCode = values.SexCode;
                    entity.m_strUserPhoto = values.UserPhoto;
                    this.props.okHandle(entity, Number(values.m_bIsAttachment), this.state.phonePath);
                }
            });
        }
        /**
         * 目的检验单位下拉Change事件
         */
        dstUnitChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
            const { children } = (opt as JSX.Element).props;
            this.dstUnitNo = val;
            this.dstUnitName = children;
        }
        /**
         * 绑定检验单位下拉
         */
        bindUnitSelect() {
            const { unitList, bcpInfo } = this.props.bcpModal!;
            const { Option } = Select;
            let options = [];
            options = unitList.map((opt: CCheckOrganization) => {
                return <Option
                    value={opt.m_strCheckOrganizationID}
                    data-name={opt.m_strCheckOrganizationName}
                    key={helper.getKey()}>
                    {opt.m_strCheckOrganizationName}
                </Option>
            });
            if (!this.unitSearched &&
                !helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strCheckOrganizationID)) {
                options.push(<Option value={bcpInfo.m_strCheckOrganizationID}>
                    {bcpInfo.m_strCheckOrganizationName}
                </Option>);
            }
            return options;
        }
        /**
         * 绑定目的检验单位下拉
         */
        bindDstUnitSelect() {
            const { unitList, bcpInfo } = this.props.bcpModal!;
            const { Option } = Select;
            let options = [];
            options = unitList.map((opt: CCheckOrganization) => {
                return <Option
                    value={opt.m_strCheckOrganizationID}
                    data-name={opt.m_strCheckOrganizationName}
                    key={helper.getKey()}>
                    {opt.m_strCheckOrganizationName}
                </Option>
            });
            if (!this.unitSearched &&
                !helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strDstOrganizationID)) {
                options.push(<Option value={bcpInfo.m_strDstOrganizationID}>
                    {bcpInfo.m_strDstOrganizationName}
                </Option>);
            }
            return options;
        }
        /**
         * 下拉Search事件(所有单位下拉共用此回调)
         */
        selectSearch = (keyword: string) => {
            const { dispatch } = this.props;
            this.unitSearched = true;
            dispatch!({ type: 'bcpModal/queryUnitData', payload: keyword });
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
            this.unitListID = val;
            this.unitListName = children;
        }
        /**
         * 绑定检验员下拉
         */
        bindOfficerSelect() {
            const { officerList } = this.props.bcpModal!;
            const { Option } = Select;
            let options = officerList.map((opt: CCheckerInfo) => {
                return <Option
                    value={opt.m_strCheckerID}
                    data-name={opt.m_strCheckerName}
                    data-id={opt.m_strCheckerID}
                    key={helper.getKey()}>
                    {opt.m_strCheckerID ? `${opt.m_strCheckerName}（${opt.m_strCheckerID}）` : opt.m_strCheckerName}
                </Option>
            });
            return options;
        }
        /**
         * 渲染表单
         */
        renderForm = (): JSX.Element => {
            // let { bcp } = this.state;
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { bcpInfo, caseData } = this.props.bcpModal;
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 19 },
            };
            return <div className="bcp-modal-root">
                <Form {...formItemLayout}>
                    <div style={{ display: 'flex' }}>
                        <Item label="有无附件" style={{ flex: 1 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                            {getFieldDecorator('m_bIsAttachment', {
                                rules: [{
                                    required: true,
                                    message: '请填写检验员'
                                }],
                                initialValue: helper.isNullOrUndefined(caseData.m_bIsAttachment) ? 0 : Number(caseData.m_bIsAttachment)
                            })(<Select>
                                <Select.Option value={1}>有附件</Select.Option>
                                <Select.Option value={0}>无附件</Select.Option>
                            </Select>)}
                        </Item>
                        <Item label="检验员" style={{ flex: 1, display: 'flex' }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                            {getFieldDecorator('officerSelect', {
                                rules: [{
                                    required: true,
                                    message: '请选择检验员'
                                }],
                                initialValue: bcpInfo.m_strCheckerID
                            })(<Select
                                notFoundContent="暂无数据"
                                placeholder="请选择一位检验员"
                                onChange={this.officerSelectChange}>
                                {this.bindOfficerSelect()}
                            </Select>)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item label="检验单位" style={{ flex: 1, display: 'flex'}} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                            {getFieldDecorator('unitList', {
                                rules: [{
                                    required: true,
                                    message: '请选择检验单位'
                                }],
                                initialValue: bcpInfo.m_strCheckOrganizationID
                            })(<Select
                                showSearch={true}
                                placeholder={"输入单位名称进行查询"}
                                defaultActiveFirstOption={false}
                                notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                showArrow={false}
                                filterOption={false}
                                onSearch={this.selectSearch}
                                onChange={this.unitListChange}>
                                {this.bindUnitSelect()}
                            </Select>)}
                        </Item>
                        <Item label="目的检验单位"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1, display: 'flex' }}>
                            {getFieldDecorator('dstUnit', {
                                rules: [{
                                    required: true,
                                    message: '请选择目的检验单位'
                                }],
                                initialValue: bcpInfo.m_strDstOrganizationID
                            })(<Select
                                showSearch={true}
                                placeholder={"输入单位名称进行查询"}
                                defaultActiveFirstOption={false}
                                notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                showArrow={false}
                                filterOption={false}
                                onSearch={this.selectSearch}
                                onChange={this.dstUnitChange}
                                style={{ width: '100%' }}>
                                {this.bindDstUnitSelect()}
                            </Select>)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="证件类型"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateType', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: helper.isNullOrUndefined(bcpInfo.m_strCertificateType) ? '111' : bcpInfo.m_strCertificateType
                            })(<Select>
                                {this.getOptions(certificateType)}
                            </Select>)}
                        </Item>
                        <Item
                            label="证件编号"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateCode', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写证件编号'
                                    }
                                ],
                                initialValue: bcpInfo.m_strCertificateCode
                            })(<Input maxLength={100} />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="证件生效日期"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateEffectDate', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写证件生效日期'
                                    }
                                ],
                                initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strCertificateEffectDate)
                                    ? ''
                                    : helper.parseDate(bcpInfo.m_strCertificateEffectDate!),
                            })(<DatePicker
                                style={{ width: '100%' }}
                                locale={locale} />)}
                        </Item>
                        <Item
                            label="证件失效日期"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateInvalidDate', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写证件失效日期'
                                    }
                                ],
                                initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strCertificateInvalidDate)
                                    ? ''
                                    : helper.parseDate(bcpInfo.m_strCertificateInvalidDate!)
                            })(<DatePicker
                                style={{ width: '100%' }}
                                locale={locale} />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="证件签发机关"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateIssueUnit', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写证件签发机关'
                                    }
                                ],
                                initialValue: bcpInfo.m_strCertificateIssueUnit
                            })(<Input maxLength={100} />)}
                        </Item>
                        <Item
                            label="证件头像"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('UserPhoto', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写证件头像'
                                    }
                                ],
                                initialValue: bcpInfo.m_strUserPhoto
                            })(<Input
                                addonAfter={<Icon type="ellipsis" onClick={this.selectDirHandle} />}
                                readOnly={true}
                                onClick={this.selectDirHandle} />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="性别"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('SexCode', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strSexCode) ? '0' : bcpInfo.m_strSexCode
                            })(<Select>
                                {this.getOptions(sexCode)}
                            </Select>)}
                        </Item>
                        <Item
                            label="民族"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('Nation', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strNation) ? '1' : bcpInfo.m_strNation
                            })(<Select>
                                {this.getOptions(ethnicity)}
                            </Select>)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="出生日期"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('Birthday', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写出生日期'
                                    }
                                ],
                                initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strBirthday)
                                    ? ''
                                    : helper.parseDate(bcpInfo.m_strBirthday!)
                            })(<DatePicker
                                style={{ width: '100%' }}
                                disabledDate={(currentDate: Moment | null) => helper.isAfter(currentDate!)}
                                locale={locale} />)}
                        </Item>
                        <Item
                            label="住址"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 14 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('Address', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写住址'
                                    }
                                ],
                                initialValue: bcpInfo.m_strAddress
                            })(<Input />)}
                        </Item>
                    </div>
                </Form>
            </div>;
        }
        render(): ReactElement {
            return <div className="bcp-modal-root">
                <Modal
                    visible={this.state.visible}
                    onOk={() => this.generateBcpClick()}
                    onCancel={() => {
                        const { dispatch } = this.props;
                        this.unitSearched = false;
                        dispatch({ type: 'bcpModal/resetBcpInfo' });
                        this.props.cancelHandle();
                    }}
                    title="BCP信息录入"
                    destroyOnClose={true}
                    width={1000}
                    okText="生成"
                    cancelText="取消"
                    okButtonProps={{ icon: 'file-sync' }}
                    cancelButtonProps={{ icon: 'close-circle' }}>
                    <div>
                        {this.renderForm()}
                    </div>
                </Modal>
            </div>
        }
    }
);

export default connect((state: any) => ({ bcpModal: state.bcpModal }))(ExtendBcpModal);