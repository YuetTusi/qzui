import React, { PropsWithRef, ReactElement, Component } from 'react';
import { Modal, Form, Input, Checkbox, Select } from 'antd';

interface IProp {
    form: any;
    visible: boolean;
    saveHandle: () => void;
    cancelHandle: () => void;
    wrappedComponentRef?: (ref: any) => void;
}

const WrappedEditModal = Form.create<IProp>({ name: 'edit' })(
    class EditModal extends Component<IProp> {
        constructor(props: IProp) {
            super(props);
        }
        renderForm(): ReactElement {
            const { getFieldDecorator } = this.props.form;
            const { Option } = Select;
            const { Item } = Form;
            const formItemLayout = {
                labelCol: {
                    sm: { span: 4 },
                },
                wrapperCol: {
                    sm: { span: 20 },
                },
            };
            return <Form {...formItemLayout}>
                <Item label="案件名称">
                    {getFieldDecorator('caseName', {
                        rules: [{ required: true, message: '请输入案件名称' }]
                    })(<Input />)}
                </Item>
                <Item label="生成BCP">
                    {getFieldDecorator('isBCP', {
                        initialValue: '0'
                    })(<Select>
                        <Option value="0">否</Option>
                        <Option value="1">是</Option>
                    </Select>)}
                </Item>
                <Item label="自动解析">
                    {getFieldDecorator('analysis', {
                        initialValue: '0'
                    })(<Select>
                        <Option value="0">否</Option>
                        <Option value="1">是</Option>
                    </Select>)}
                </Item>
            </Form>;
        }
        render(): ReactElement {

            return <Modal title="新增案件"
                visible={this.props.visible}
                okText="保存" cancelText="取消"
                okButtonProps={{ icon: 'save' }}
                cancelButtonProps={{ icon: 'rollback' }}
                onOk={this.props.saveHandle}
                onCancel={this.props.cancelHandle}
                destroyOnClose={true}>
                {this.renderForm()}
            </Modal>;
        }
    }
);
/**
 * 案件信息弹出框
 */
export default WrappedEditModal;