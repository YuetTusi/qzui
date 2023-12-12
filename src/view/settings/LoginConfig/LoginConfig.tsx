import React, { useEffect } from 'react';
import Button from 'antd/lib/button';
import InputNumber from 'antd/lib/input-number';
import Form from 'antd/lib/form';
import Title from '@src/components/title';
import { LoginConfigProp } from './prop';
import './LoginConfig.less';
import { LocalStoreKey } from '@src/utils/localStore';
import message from 'antd/lib/message';

const { create, Item } = Form;

const LoginConfig = create<LoginConfigProp>()(({ form }: LoginConfigProp) => {

    const { validateFields, getFieldDecorator, setFieldsValue } = form;

    useEffect(() => {
        const allowCount = localStorage.getItem(LocalStoreKey.AllowCount);
        const lockMinutes = localStorage.getItem(LocalStoreKey.LockMinutes);
        const loginOverTime = localStorage.getItem(LocalStoreKey.LoginOverTime);
        setFieldsValue({
            allowCount: allowCount === null ? 5 : Number(allowCount),
            lockMinutes: lockMinutes === null ? 10 : Number(lockMinutes),
            loginOverTime: loginOverTime === null ? 30 : Number(loginOverTime)
        });
    }, []);

    const onSubmit = () => {
        message.destroy();
        validateFields((error, values) => {
            if (error) {
                console.warn(error);
            } else {
                const {
                    allowCount,
                    lockMinutes,
                    loginOverTime
                } = values;
                localStorage.setItem(LocalStoreKey.AllowCount, allowCount.toString());
                localStorage.setItem(LocalStoreKey.LockMinutes, lockMinutes.toString());
                localStorage.setItem(LocalStoreKey.LoginOverTime, loginOverTime.toString());
                message.success('保存成功，请重启应用生效新配置');
            }
        });
    };

    return <div className="login-config-root">

        <Title
            onOk={() => onSubmit()}
            okText="保存">登录验证配置</Title>
        <div className="form-box">
            <div className="sort-root">
                <div className="sort">
                    <Form
                        layout="vertical">
                        <Item
                            label="密码尝试次数">
                            {
                                getFieldDecorator('allowCount', {
                                    rules: [
                                        { required: true, message: '请输入密码尝试次数' }
                                    ]
                                })(<InputNumber
                                    min={1}
                                    max={5}
                                    placeholder="数字，最大5次"
                                    style={{ width: '100%' }} />)
                            }
                        </Item>
                        <Item
                            label="锁定时间（分钟）">
                            {
                                getFieldDecorator('lockMinutes', {
                                    rules: [
                                        { required: true, message: '请输入锁定时间' }
                                    ]
                                })(<InputNumber
                                    min={1}
                                    style={{ width: '100%' }} />)
                            }

                        </Item>
                        <Item
                            label="登录超时时间（分钟）">
                            {
                                getFieldDecorator('loginOverTime', {
                                    rules: [
                                        { required: true, message: '请输入锁定时间' }
                                    ]
                                })(<InputNumber
                                    min={1}
                                    style={{ width: '100%' }} />)
                            }
                        </Item>
                    </Form>
                </div>
            </div>
        </div>
    </div>
});

export default LoginConfig;