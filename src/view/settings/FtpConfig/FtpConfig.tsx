import React, { Component } from 'react';
import { remote } from 'electron';
import Form, { FormComponentProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { StoreComponent } from '@type/model';
import { IP, Port } from '@src/utils/regex';
import { FtpStoreState } from '@src/model/settings/FtpConfig/FtpConfig';
import './FtpConfig.less';

interface Prop extends StoreComponent, FormComponentProps {
    ftpConfig: FtpStoreState;
}

/**
 * @description FTP服务器配置
 * BcpFtp.exe 127.0.0.1 21 user pwd / file1 file2 file3
 */
let ExtendFtpConfig = Form.create<Prop>({ name: 'ftp' })(
    class FtpConfig extends Component<Prop> {
        constructor(props: any) {
            super(props);
        }
        componentDidMount() {
            const { dispatch } = this.props;
            dispatch({ type: 'ftpConfig/queryConfig' });
        }
        saveHandle = () => {
            const { dispatch } = this.props;
            const { validateFields } = this.props.form;
            validateFields((err, values: FtpStoreState) => {
                if (!err) {
                    dispatch({ type: 'ftpConfig/saveConfig', payload: values });
                }
            });
        }
        render(): JSX.Element {
            const { ip, port, username, password } = this.props.ftpConfig;
            const { getFieldDecorator, setFieldsValue } = this.props.form;
            return <div className="server-config">
                <Title okText="确定" onOk={this.saveHandle}>FTP配置</Title>
                <div className="server-cfg-panel">
                    <div className="form-panel">
                        <Form layout="horizontal">
                            <Form.Item label="FTP IP">
                                {getFieldDecorator('ip', {
                                    rules: [
                                        { required: true, message: '请填写FTP IP' },
                                        { pattern: IP, message: '请填写合法的IP地址' }
                                    ],
                                    initialValue: ip
                                })(<Input placeholder="IP地址" />)}
                            </Form.Item>
                            <Form.Item label="FTP端口">
                                {getFieldDecorator('port', {
                                    rules: [
                                        { required: true, message: '请填写FTP端口' },
                                        { pattern: Port, message: '5位以内的数字' }
                                    ],
                                    initialValue: port
                                })(<Input placeholder="数字, 5位以内" />)}
                            </Form.Item>
                            <Form.Item label="用户名">
                                {getFieldDecorator('username', {
                                    rules: [{ required: true, message: '请填写用户名' }],
                                    initialValue: username
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item label="口令">
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请填写口令' }],
                                    initialValue: password
                                })(<Input.Password />)}
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        }
    }
);

export default connect((state: any) => ({ ftpConfig: state.ftpConfig }))(ExtendFtpConfig);
