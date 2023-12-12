import { join } from 'path';
import React, { useEffect, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Button from 'antd/lib/button';
import Divider from 'antd/lib/divider';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import { helper } from '@src/utils/helper';
import { StateTree } from '@src/type/model';
import Manufaturer from '@src/schema/socket/Manufaturer';
import { RegisterUserModal } from './RegisterUserModal';
import { ModifyPasswordModal } from './ModifyPasswordModal';
import { LoginProp } from './prop';
import './Login.less';

const manufaturerPath =
    helper.IS_DEV
        ? join(helper.CWD, './data/manufaturer.json')
        : join(helper.CWD, './resources/config/manufaturer.json');

const { Password } = Input;
const { Item, create } = Form;
const { } = helper.readConf();

/**
 * 用户登录
 */
const Login = create<LoginProp>({ name: 'loginForm' })(({ form, login, dispatch }: LoginProp) => {

    const { getFieldDecorator, validateFields } = form;
    const [manu, setManu] = useState<Manufaturer>();
    const [modifyPasswordModalVisible, setModifyPasswordModalVisible] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                const manu = await helper.readJSONFile(manufaturerPath);
                setManu(manu);
            } catch (error) {
                console.warn(error);
            }
        })();
    }, []);

    useEffect(() => {
        dispatch({ type: 'login/init' });
    }, []);

    /**
     * 登录Submit
     */
    const loginSubmit = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        validateFields((error, values) => {
            if (error) {
                console.clear();
                console.warn(error);
            } else {
                const { userName, password } = values;
                dispatch({
                    type: 'login/queryByNameAndPassword',
                    payload: { userName, password }
                });
            }
        });
    };

    return <div className="login-root">
        <div className="form-box">
            <div className="left">
                <div>
                    <div className="wel">欢迎使用</div>
                    <div className="caption">{manu?.materials_name ?? ''}</div>
                </div>
            </div>
            <div className="right">
                <h3>用户登录</h3>
                <Divider />
                <Form layout="vertical">
                    <Item
                        label="用户名">
                        {getFieldDecorator('userName', {
                            rules: [{
                                required: true, message: '请填写用户名'
                            }]
                        })(<Input />)}
                    </Item>
                    <Item
                        label="口令">
                        {getFieldDecorator('password', {
                            rules: [{
                                required: true, message: '请填写口令'
                            }]
                        })(<Password visibilityToggle={false} />)}
                    </Item>
                    <Item>
                        <Row type="flex" justify="space-between">
                            <Col>
                                <Button
                                    onClick={() => setModifyPasswordModalVisible(true)}
                                    type="link">修改口令</Button>
                            </Col>
                            <Col>
                                <Button
                                    onClick={loginSubmit}
                                    type="primary"
                                    icon="key">
                                    <span>登录</span>
                                </Button>
                            </Col>
                        </Row>
                    </Item>
                </Form>
            </div>
        </div>
        <RegisterUserModal
            visible={login.registerUserModalVisible}
            onCancel={() => dispatch({ type: 'login/setRegisterUserModalVisible', payload: false })}
            onOk={(userName: string, password: string) => {
                dispatch({
                    type: 'login/saveOrUpdateUser', payload: { userName, password }
                });
            }} />
        <ModifyPasswordModal
            visible={modifyPasswordModalVisible}
            onCancel={() => setModifyPasswordModalVisible(false)}
            onOk={(newPassword) => {
                dispatch({
                    type: 'login/updatePassword', payload: newPassword
                });
                setModifyPasswordModalVisible(false)
            }}
        />
    </div>
});

export default connect((state: StateTree) => ({
    login: state.login
}))(Login);