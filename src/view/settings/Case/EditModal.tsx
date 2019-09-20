import React, { PropsWithRef, ReactElement, Component } from 'react';
import { Modal, Form, Input, Icon } from 'antd';

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
        render(): ReactElement {
            const { getFieldDecorator } = this.props.form;
            return <Modal title="新增案件"
                visible={this.props.visible}
                okText="保存" cancelText="取消"
                okButtonProps={{ icon: 'save' }}
                cancelButtonProps={{ icon: 'rollback' }}
                onOk={this.props.saveHandle}
                onCancel={this.props.cancelHandle}
                destroyOnClose={true}>
                <Form>
                    <Form.Item label="案件名称">
                        {getFieldDecorator('caseName', {
                            rules: [{ required: true, message: '请输入案件名称' }]
                        })(<Input />)}
                    </Form.Item>
                </Form>
            </Modal>;
        }
    }
);
/**
 * 案件信息弹出框
 */
export default WrappedEditModal;