import React, { MouseEvent } from 'react';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import { PasswordDigit } from '@src/utils/regex';
import { RegisterUserModalProp } from './prop';

const { Password } = Input;
const { Item, create } = Form;

/**
 * 新用户注册窗口
 */
const RegisterUserModal = create<RegisterUserModalProp>({ name: 'registerForm' })(({
    form,
    visible,
    onCancel,
    onOk
}: RegisterUserModalProp) => {

    const { resetFields, getFieldDecorator, validateFields } = form;

    const onOkClick = (event: MouseEvent) => {
        event.preventDefault();
        onSumbitClick();
    };

    const onCancelClick = (event: MouseEvent) => {
        event.preventDefault();
        resetFields();
        onCancel();
    };

    const onSumbitClick = () => {

        validateFields((err, values) => {
            if (err) {
                console.clear();
                console.warn(err);
            } else {
                onOk(values.userName, values.password);
            }
        });
    }

    return <Modal
        footer={[
            <Button
                onClick={onCancelClick}
                icon="close-circle"
                type="default"
                key="RUM_1">
                <span>取消</span>
            </Button>,
            <Button
                onClick={onOkClick}
                icon="check-circle"
                type="primary"
                key="RUM_2">
                <span>确定</span>
            </Button>
        ]}
        onCancel={onCancelClick}
        visible={visible}
        centered={true}
        maskClosable={false}
        destroyOnClose={true}
        width={400}
        getContainer="#root"
        title="新用户">
        <Form
            layout="vertical">
            <Item
                label="用户">
                {getFieldDecorator('userName', {
                    rules: [
                        { required: true, message: '请填写用户' }
                    ]
                })(<Input />)}
            </Item>
            <Item
                label="口令">
                {
                    getFieldDecorator('password', {
                        rules: [
                            { required: true, message: '请填写口令' },
                            { pattern: PasswordDigit, message: '8~20位，数字、字母或特殊符号组合' },
                            {
                                validator(_, value) {
                                    if (!value || helper.passwordStrength(value) >= 2) {
                                        return Promise.resolve();
                                    } else {
                                        return Promise.reject(new Error('口令过于简单，请使用字母、数字，特殊符号组合'));
                                    }
                                },
                            }
                        ]
                    })(<Password
                        visibilityToggle={false}
                        placeholder="8~20位，数字、字母或特殊符号组合" />)
                }

            </Item>
            <Item
                label="确认口令">
                {getFieldDecorator('confirmPassword', {
                    rules: [
                        { required: true, message: '请填写确认口令' },
                        {
                            validator(_, value, callback) {
                                if (value && value !== form.getFieldValue('password')) {
                                    callback('确认口令与原口令不一致');
                                } else {
                                    callback();
                                }
                            }
                        }
                    ]
                })(<Password
                    visibilityToggle={false}
                    placeholder="重复输入口令" />)}
            </Item>
        </Form>
    </Modal>
});

export { RegisterUserModal };