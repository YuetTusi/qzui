import React, { ReactElement, Component, MouseEvent } from 'react';
import { Modal, Form, Select } from 'antd';
import { IDispatchFunc } from '@src/type/model';

interface IProp {
    //是否可见
    visible: boolean;
    form: any;
    dispatch?: IDispatchFunc;
    //保存回调
    saveHandle?: (data: IFormValue) => void;
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

class CaseInputModal extends Component<IProp, IState>{
    constructor(props: IProp) {
        super(props);
        this.state = { visible: false };
    }
    componentWillReceiveProps(nextProp: IProp) {
        this.setState({ visible: nextProp.visible });
    }
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
        return <Form>
            <Item label="所属案件">
                {getFieldDecorator('case', {
                    rules: [{
                        required: true,
                        message: '请选择案件'
                    }]
                })(<Select notFoundContent="暂无数据">
                    <Option value="-1">Case2019028234</Option>
                </Select>)}
            </Item>
            <Item label="警员">
                {getFieldDecorator('police', {
                    rules: [{
                        required: true,
                        message: '请选择警员'
                    }]
                })(<Select notFoundContent="暂无数据">
                    <Option value="111">123456</Option>
                </Select>)}
            </Item>
            <Item label="采集单位">
                {getFieldDecorator('unit', {
                    rules: [{
                        required: true,
                        message: '请选择采集单位'
                    }]
                })(<Select notFoundContent="暂无数据">
                    <Option value="111">123456</Option>
                </Select>)}
            </Item>
        </Form>
    }
    render(): ReactElement {
        return <Modal visible={this.state.visible}
            cancelText="取消" okText="确定"
            onCancel={() => this.setState({ visible: false })}
            onOk={this.formSubmit} destroyOnClose={true}>
            <div>
                {this.renderForm()}
            </div>
        </Modal>
    }
}


const ProxyCaseInputModal = Form.create<IProp>()(CaseInputModal);

export default ProxyCaseInputModal;