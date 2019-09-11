import React, { ReactElement, Component, MouseEvent } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import { IDispatchFunc, IObject } from '@src/type/model';
import { connect } from 'dva';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
import { helper } from '@src/utils/helper';

interface IProp {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 手机品牌名称
     */
    piMakerName: string;
    form: any;
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
     * 警员
     */
    police: string;
    /**
     * 采集单位
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
            dispatch({ type: 'caseInputModal/setCaseList', payload: [{ id: 'Case1001', name: 'Case1001' }] });
            dispatch({ type: 'caseInputModal/setPoliceList', payload: [{ id: '1001', name: '张所长' }] });
            dispatch({ type: 'caseInputModal/setUnit', payload: { unitCode: '10001', unit: '大红门派出所' } });
        }
        componentWillReceiveProps(nextProp: IProp) {
            this.setState({ visible: nextProp.visible });
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
            const { Option } = Select;
            const { getFieldDecorator } = this.props.form;
            const { caseList, policeList, unit, unitCode } = this.props.caseInputModal as IObject;
            // console.log(this.props.caseInputModal);
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
                        {caseList.map((item: IObject) => <Option value={item.id} key={helper.getKey()}>{item.name}</Option>)}
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
                            initialValue: this.props.piMakerName,
                        })(<Input placeholder="案件内名称唯一" />)
                    }
                </Item>
                <Item label="警员">
                    {getFieldDecorator('police', {
                        rules: [{
                            required: true,
                            message: '请选择警员'
                        }]
                    })(<Select notFoundContent="暂无数据">
                        {policeList.map((item: IObject) => <Option value={item.id} key={helper.getKey()}>{item.name}</Option>)}
                    </Select>)}
                </Item>
                <Item label="采集单位">
                    {getFieldDecorator('unit', {
                        rules: [{
                            required: true,
                            message: '请在设置功能中添加'
                        }],
                        initialValue: unit
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