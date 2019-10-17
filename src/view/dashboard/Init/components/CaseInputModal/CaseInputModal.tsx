import React, { ReactElement, Component, MouseEvent } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import { IDispatchFunc, IObject } from '@src/type/model';
import { connect } from 'dva';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
import { helper } from '@src/utils/helper';
import { FormComponentProps } from 'antd/lib/form';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CCoronerInfo } from '@src/schema/CCoronerInfo';

interface IProp extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 手机品牌名称
     */
    piMakerName: string;
    /**
     * 手机型号
     */
    piPhoneType: string;
    dispatch?: IDispatchFunc;
    caseInputModal?: IObject;
    //保存回调
    saveHandle?: (data: IFormValue) => void;
    //取消回调
    cancelHandle?: () => void;
}
interface IState {
    //是否可见
    visible: boolean;
}
/**
 * 表单对象
 */
interface IFormValue {
    /**
     * 案件
     */
    case: string;
    /**
     * 检验员
     */
    police: string;
    /**
     * 检验单位
     */
    unit: string;
}

const ProxyCaseInputModal = Form.create<IProp>()(
    class CaseInputModal extends Component<IProp, IState>{
        constructor(props: IProp) {
            super(props);
            this.state = {
                visible: false
            };
        }
        componentDidMount() {
            const dispatch = this.props.dispatch as IDispatchFunc;
            dispatch({ type: 'caseInputModal/queryCaseList' });
            dispatch({ type: 'caseInputModal/queryOfficerList' });
            dispatch({ type: 'caseInputModal/queryUnit' });
            // dispatch({ type: 'caseInputModal/setCaseList', payload: [{ id: 'Case1001', name: 'Case1001' }] });
            // dispatch({ type: 'caseInputModal/setPoliceList', payload: [{ id: '1001', name: '张所长' }] });
            // dispatch({ type: 'caseInputModal/setUnit', payload: { unitCode: '10001', unit: '大红门派出所' } });
        }
        componentWillReceiveProps(nextProp: IProp) {
            this.setState({ visible: nextProp.visible });
        }
        /**
         * 绑定案件下拉数据
         */
        bindCaseSelect() {
            const { caseList } = this.props.caseInputModal as IObject;
            const { Option } = Select;
            return caseList.map((opt: CCaseInfo) => {
                let pos = opt.m_strCaseName.lastIndexOf('\\');
                return <Option value={opt.m_strCaseName} key={helper.getKey()}>
                    {opt.m_strCaseName.substring(pos + 1)}
                </Option>
            });
        }
        /**
         * 绑定检验员下拉
         */
        bindOfficerSelect() {
            // m_strCoronerName
            const { officerList } = this.props.caseInputModal as IObject;
            const { Option } = Select;
            return officerList.map((opt: CCoronerInfo) => {
                return <Option value={opt.m_strUUID} key={helper.getKey()}>
                    {opt.m_strCoronerID ? `${opt.m_strCoronerName}（${opt.m_strCoronerID}）` : opt.m_strCoronerName}
                </Option>
            });
        }
        /**
         * 验证手机名称唯一
         */
        validatePhoneName = (rule: any, value: string, callback: any) => {
            const { getFieldValue } = this.props.form;
            let caseName = getFieldValue('case'); //案件名称
            setTimeout(() => {
                if (value === '1' || value === '2') {
                    callback('手机名称已存在');
                } else {
                    callback();
                }
            }, 1000);

        }
        /**
         * 表单提交
         */
        formSubmit = (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();

            const { validateFields } = this.props.form;
            validateFields((errors: any, values: IFormValue) => {
                if (!errors) {
                    if (this.props.saveHandle) {
                        this.props.saveHandle(values);
                    }
                }
            });
        }
        renderForm = (): ReactElement => {
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { unitName, unitCode } = this.props.caseInputModal as IObject;

            return <Form layout="vertical">
                <Item>
                    {getFieldDecorator('unitCode', { initialValue: unitCode })(<Input type="hidden" />)}
                </Item>
                <Item label="所属案件">
                    {getFieldDecorator('case', {
                        rules: [{
                            required: true,
                            message: '请选择案件'
                        }]
                    })(<Select notFoundContent="暂无数据">
                        {this.bindCaseSelect()}
                    </Select>)}
                </Item>
                <Item label="手机名称" hasFeedback={true}>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: '填写手机名称'
                            }, {
                                validator: this.validatePhoneName
                            }],
                            initialValue: this.props.piPhoneType,
                        })(<Input placeholder="案件内名称唯一" />)
                    }
                </Item>
                <Item label="手机持有人">
                    {
                        getFieldDecorator('user', {
                            rules: [{
                                required: true,
                                message: '填写持有人'
                            }]
                        })(<Input />)
                    }
                </Item>
                <Item label="检验员">
                    {getFieldDecorator('police', {
                        rules: [{
                            required: true,
                            message: '请选择检验员'
                        }]
                    })(<Select notFoundContent="暂无数据">
                        {this.bindOfficerSelect()}
                    </Select>)}
                </Item>
                <Item label="检验单位">
                    {getFieldDecorator('unit', {
                        rules: [{
                            required: true,
                            message: '请在设置功能中添加'
                        }],
                        initialValue: unitName
                    })(<Input readOnly={true} />)}
                </Item>
            </Form>
        }
        render(): ReactElement {
            return <Modal visible={this.state.visible}
                title="案件信息录入"
                cancelText="取消" okText="确定"
                onCancel={this.props.cancelHandle}
                onOk={this.formSubmit}
                destroyOnClose={true}>
                <div>
                    {this.renderForm()}
                </div>
            </Modal>
        }
    }
);

export default connect((state: IObject) => {
    return {
        caseInputModal: state.caseInputModal
    }
})(ProxyCaseInputModal);