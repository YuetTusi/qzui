import { remote, OpenDialogReturnValue } from 'electron';
import React, { Component, ReactElement, MouseEvent } from 'react';
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
import './BcpModal.less';

/**
 * BCP信息录入框
 */
const ExtendBcpModal = Form.create<Prop>({ name: 'BcpForm' })(
    class BcpModal extends Component<Prop, State> {
        /**
         * BCP检验单位编号
         */
        bcpUnitNo: string;
        /**
         * BCP检验单位名称
         */
        bcpUnitName: string;
        /**
         * 用户通过输入查询过BCP单位
         */
        unitSearched: boolean;

        constructor(props: Prop) {
            super(props);
            this.state = {
                visible: false,
                phonePath: ''
            }
            this.bcpUnitNo = '';
            this.bcpUnitName = '';
            this.unitSearched = false;
        }
        componentWillReceiveProps(nextProp: Prop, nextState: State) {
            const { dispatch } = this.props;
            // console.log(nextProp.phonePath);
            // dispatch({ type: 'bcpModal/queryBcp', payload: nextProp.phonePath });
            this.setState({
                visible: nextProp.visible,
                phonePath: nextProp.phonePath
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
                    // console.log(this.bcpUnitName);
                    entity.m_strBCPCheckOrganizationName = this.bcpUnitName;
                    entity.m_strBCPCheckOrganizationID = values.BCPCheckOrganizationID;
                    entity.m_strAddress = values.Address;
                    entity.m_strBirthday = helper.isNullOrUndefined(values.Birthday) ? '' : values.Birthday.format('YYYY-MM-DD');
                    entity.m_strCertificateCode = values.CertificateCode;
                    entity.m_strCertificateEffectDate = helper.isNullOrUndefined(values.CertificateEffectDate) ? '' : values.CertificateEffectDate.format('YYYY-MM-DD');
                    entity.m_strCertificateInvalidDate = helper.isNullOrUndefined(values.CertificateInvalidDate) ? '' : values.CertificateInvalidDate.format('YYYY-MM-DD');
                    entity.m_strCertificateIssueUnit = values.CertificateIssueUnit;
                    entity.m_strCertificateType = values.CertificateType;
                    entity.m_strNation = values.Nation;
                    entity.m_strSexCode = values.SexCode;
                    entity.m_strUserPhoto = values.UserPhoto;
                    this.props.okHandle(entity);
                }
            });
        }
        /**
         * BCP检验单位下拉Change事件
         */
        bcpUnitChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
            const { children } = (opt as JSX.Element).props;
            this.bcpUnitNo = val;
            this.bcpUnitName = children;
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
            if (!this.unitSearched) {
                options.push(<Option value={bcpInfo.m_strBCPCheckOrganizationID}>
                    {bcpInfo.m_strBCPCheckOrganizationName}
                </Option>);
            }
            return options;
        }
        /**
         * 检验单位下拉Search事件
         */
        unitListSearch = (keyword: string) => {
            const { dispatch } = this.props;
            this.unitSearched = true;
            dispatch!({ type: 'bcpModal/queryUnitData', payload: keyword });
        }
        /**
         * 渲染表单
         */
        renderForm = (): JSX.Element => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { bcpInfo } = this.props.bcpModal;
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 },
            };
            return <Form {...formItemLayout}>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="BCP检验单位"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('BCPCheckOrganizationID', {
                            rules: [{
                                required: true,
                                message: '请选择BCP检验单位'
                            }],
                            initialValue: bcpInfo.m_strBCPCheckOrganizationID
                        })(<Select
                            showSearch={true}
                            placeholder={"输入单位名称进行查询"}
                            defaultActiveFirstOption={false}
                            notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            showArrow={false}
                            filterOption={false}
                            onSearch={this.unitListSearch}
                            onChange={this.bcpUnitChange}>
                            {this.bindUnitSelect()}
                        </Select>)}
                    </Item>
                    <Item
                        label="证件类型"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
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
                </div>
                <div style={{ display: 'flex' }}>
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
                            ],
                            initialValue: bcpInfo.m_strCertificateCode
                        })(<Input maxLength={100} />)}
                    </Item>
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
                            ],
                            initialValue: bcpInfo.m_strCertificateIssueUnit
                        })(<Input maxLength={100} />)}
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
                            ],
                            initialValue: helper.isNullOrUndefined(bcpInfo.m_strCertificateEffectDate) ? '' : helper.parseDate(bcpInfo.m_strCertificateEffectDate!),
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
                            ],
                            initialValue: helper.isNullOrUndefined(bcpInfo.m_strCertificateInvalidDate) ? '' : helper.parseDate(bcpInfo.m_strCertificateInvalidDate!)
                        })(<DatePicker
                            style={{ width: '100%' }}
                            locale={locale} />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="性别"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('SexCode', {
                            rules: [
                                { required: false }
                            ],
                            initialValue: helper.isNullOrUndefined(bcpInfo.m_strSexCode) ? '0' : bcpInfo.m_strSexCode
                        })(<Select>
                            {this.getOptions(sexCode)}
                        </Select>)}
                    </Item>
                    <Item
                        label="民族"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('Nation', {
                            rules: [
                                { required: false }
                            ],
                            initialValue: helper.isNullOrUndefined(bcpInfo.m_strNation) ? '1' : bcpInfo.m_strNation
                        })(<Select>
                            {this.getOptions(ethnicity)}
                        </Select>)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
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
                            ],
                            initialValue: helper.isNullOrUndefined(bcpInfo.m_strBirthday) ? '' : helper.parseDate(bcpInfo.m_strBirthday!)
                        })(<DatePicker
                            style={{ width: '100%' }}
                            locale={locale} />)}
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
                        label="住址"
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
            </Form>;
        }
        render(): ReactElement {
            return <div className="bcp-modal-root">
                <Modal
                    visible={this.state.visible}
                    onOk={() => this.generateBcpClick()}
                    onCancel={() => {
                        this.unitSearched = false;
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