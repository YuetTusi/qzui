import React, { Component } from 'react';
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
 * @description 服务器配置
 */
let ExtendFtpConfig = Form.create<Prop>({ name: 'ftp' })(
    class FtpConfig extends Component<Prop> {
        constructor(props: any) {
            super(props);
        }
        saveHandle = () => {
            const {validateFields}=this.props.form;

            validateFields();
        }
        render(): JSX.Element {
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
                                    ]
                                })(<Input placeholder="IP地址" />)}
                            </Form.Item>
                            <Form.Item label="FTP端口">
                                {getFieldDecorator('port', {
                                    rules: [
                                        { required: true, message: '请填写FTP端口' },
                                        { pattern: Port, message: '5位以内的数字' }
                                    ],
                                    initialValue: 21
                                })(<Input placeholder="数字, 5位以内" />)}
                            </Form.Item>
                            <Form.Item label="用户名">
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: '请填写用户名' }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item label="口令">
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请填写口令' }]
                                })(<Input.Password />)}
                            </Form.Item>
                            <Form.Item label="文件上传路径">
                                {getFieldDecorator('uploadPath', {
                                    rules: [{ required: false, message: '请填写文件上传路径' }]
                                })(<Input />)}
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        }
    }
);

export default connect((state: any) => ({ ftpConfig: state.ftpConfig }))(ExtendFtpConfig);
