import { remote, OpenDialogReturnValue } from 'electron';
import React, { Component, ReactElement, MouseEvent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { IObject } from '@src/type/model';
import { Prop, State, FormValue } from './ComponentType';
import DatePicker from 'antd/lib/date-picker'
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { helper } from '@src/utils/helper';
import { caseType } from '@src/schema/CaseType';
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';
import { certificateType } from '@src/schema/CertificateType';
import './BcpModal.less';

/**
 * BCP信息录入框
 */
const ExtendBcpModal = Form.create<Prop>({ name: 'BcpForm' })(
    class BcpModal extends Component<Prop, State> {
        constructor(props: Prop) {
            super(props);
            this.state = {
                visible: false
            }
        }
        componentDidMount() { }
        componentWillReceiveProps(nextProp: Prop, nextState: State) {
            this.setState({
                visible: nextProp.visible
            });
        }
        /**
         * 将JSON数据转为Options元素
         * @param data JSON数据
         */
        getOptions = (data: Array<IObject>): JSX.Element[] => {
            const { Option } = Select;
            return data.map<JSX.Element>((item: IObject) =>
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
         * 生成BCP按钮Click
         */
        generateBcpClick = () => {
            const { validateFields } = this.props.form;
            validateFields((errors: any, values: FormValue) => {
                if (helper.isNullOrUndefined(errors)) {
                    this.props.okHandle(values);
                }
            });
        }
        /**
         * 渲染表单
         */
        renderForm = (): JSX.Element => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const formItemLayout = {
                labelCol: { span: 5 },
                wrapperCol: { span: 18 },
            };
            return <Form {...formItemLayout}>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人姓名"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('Name', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人姓名'
                                }
                            ]
                        })(<Input />)}

                    </Item>
                    <Item
                        label="检材持有人证件类型"
                        labelCol={{ span: 10 }}
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
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人证件编号"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateCode', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人证件编号'
                                }
                            ]
                        })(<Input />)}
                    </Item>
                    <Item
                        label="检材持有人证件签发机关"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateIssueUnit', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人证件签发机关'
                                }
                            ]
                        })(<Input />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人证件生效日期"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateEffectDate', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人证件生效日期'
                                }
                            ],
                            initialValue: moment(),
                        })(<DatePicker
                            style={{ width: '100%' }}
                            locale={locale} />)}
                    </Item>
                    <Item
                        label="检材持有人证件失效日期"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateInvalidDate', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人证件失效日期'
                                }
                            ],
                            initialValue: moment()
                        })(<DatePicker
                            style={{ width: '100%' }}
                            locale={locale} />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人性别"
                        labelCol={{ span: 10 }}
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
                    <Item
                        label="检材持有人民族"
                        labelCol={{ span: 10 }}
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
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人生日"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('Birthday', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人生日'
                                }
                            ],
                            initialValue: moment()
                        })(<DatePicker
                            style={{ width: '100%' }}
                            locale={locale} />)}
                    </Item>
                    <Item
                        label="检材持有人证件头像"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('UserPhoto', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人证件头像'
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
                        label="检材持有人住址"
                        style={{ flex: 1 }}>
                        {getFieldDecorator('Address', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写检材持有人住址'
                                }
                            ]
                        })(<Input />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="执法办案系统案件编号"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CaseNo', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写执法办案系统案件编号'
                                }
                            ]
                        })(<Input />)}
                    </Item>
                    <Item
                        label="执法办案系统案件类别"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CaseType', {
                            rules: [
                                { required: false }
                            ],
                            initialValue: '100'
                        })(<Select>
                            {this.getOptions(caseType)}
                        </Select>)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="执法办案系统案件名称"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CaseName', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写执法办案系统案件名称'
                                }
                            ]
                        })(<Input />)}
                    </Item>
                    <Item
                        label="执法办案人员编号/检材持有人编号"
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CasePersonNum', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写执法办案人员编号/检材持有人编号'
                                }
                            ]
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
                    onCancel={() => this.props.cancelHandle()}
                    title="BCP信息录入"
                    destroyOnClose={true}
                    width={1200}
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