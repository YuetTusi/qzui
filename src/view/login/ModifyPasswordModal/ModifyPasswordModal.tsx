import throttle from 'lodash/throttle';
import React, { MouseEvent } from 'react';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import { PasswordDigit } from '@src/utils/regex';
import { ModifyPasswordModalProp } from './prop';

const { Password } = Input;
const { create, Item } = Form;

/**
 * 密码修改框
 */
const ModifyPasswordModal = create<ModifyPasswordModalProp>()(({
    visible,
    form,
    onCancel,
    onOk
}: ModifyPasswordModalProp) => {

    const {
        getFieldDecorator, getFieldValue, resetFields, validateFields
    } = form;

    const onOkClick = (event: MouseEvent) => {
        event.preventDefault();
        onSubmit();
    };

    const onCancelClick = (event: MouseEvent) => {
        event.preventDefault();
        resetFields();
        onCancel();
    };

    const onSubmit = () => {

        validateFields((error, values) => {

            if (error) {
                console.log(error);
            } else {
                const { newPassword } = values;
                onOk(newPassword);
                resetFields();
            }
        });
    };

    /**
     * 验证原口令一致
     */
    const validOldPassword = throttle(async (_: any, password: string) => {
        try {
            const old = await helper.oldPasswordEqual();
            if (old !== password && password !== undefined) {
                throw new Error('原口令不正确');
            }
        } catch (error) {
            throw error;
        }
    }, 100);

    /**
     * 验证新密码必须更换
     */
    const validChangePassword = throttle(async (_: any, password: string) => {
        try {
            const old = await helper.oldPasswordEqual();
            if (old === password) {
                throw new Error('请编写新口令');
            }
        } catch (error) {
            throw error;
        }
    }, 100);

    return <Modal
        footer={[
            <Button
                onClick={onCancelClick}
                icon="close-circle"
                type="default"
                key="MPM_1">
                <span>取消</span>
            </Button>,
            <Button
                onClick={onOkClick}
                icon="check-circle"
                type="primary"
                key="MPM_2">
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
        title="修改口令">
        <Form layout="vertical">
            <Item
                label="原口令">
                {getFieldDecorator('password', {
                    rules: [
                        { required: true, message: '请填写原口令' },
                        { validator: validOldPassword }
                    ]
                })(<Password visibilityToggle={false} placeholder="请输入原口令" />)}
            </Item>
            <Item
                label="新口令">
                {getFieldDecorator('newPassword', {
                    rules: [
                        { required: true, message: '请填写新口令' },
                        { pattern: PasswordDigit, message: '口令长度8~20位\n' },
                        { validator: validChangePassword },
                        {
                            validator(_, value) {
                                if (!value || helper.passwordStrength(value) >= 2) {
                                    return Promise.resolve();
                                } else {
                                    return Promise.reject(new Error('请使用字母、数字或特殊符号组合'));
                                }
                            }
                        }
                    ]
                })(<Password
                    visibilityToggle={false}
                    placeholder='8~20位，数字、字母或特殊符号组合' />)}
            </Item>
            <Item
                label="确认口令">
                {getFieldDecorator('confirmPassword', {
                    rules: [
                        { required: true, message: '请填写确认口令' },
                        {
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('确认口令与新口令不一致'));
                            }
                        }
                    ]
                })(<Password
                    visibilityToggle={false}
                    placeholder="重复输入新口令" />)}
            </Item>
        </Form>
    </Modal>
});

export { ModifyPasswordModal };