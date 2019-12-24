import React, { Component, ReactElement } from 'react';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Upload from 'antd/lib/upload';
import Icon from 'antd/lib/icon';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { IObject, StoreComponent } from '@type/model';
import { IP, Port } from '@src/utils/regex';
import './ServerConfig.less';

interface IProp extends StoreComponent {
    //antd表单
    form: any;
}

/**
 * @description 服务器配置
 */
class ServerConfig extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        const { getFieldDecorator, setFieldsValue } = this.props.form;
        return <div className="server-config">
            <Title okText="确定">服务器配置</Title>
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
                                ]
                            })(<Input placeholder="数字, 5位以内" />)}
                        </Form.Item>
                        <Form.Item label="FTP用户名">
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请填写FTP用户名' }]
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label="FTP密码">
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请填写FTP密码' }]
                            })(<Input.Password />)}
                        </Form.Item>
                        <Form.Item label="FTP上传路径">
                            <Upload directory={true} beforeUpload={(file: any) => {
                                setFieldsValue({ casePath: file.path });
                                return false;
                            }} showUploadList={false}>
                                {getFieldDecorator('casePath', {
                                    rules: [{ required: true, message: '请选择FTP上传路径' }]
                                })(<Input addonAfter={<Icon type="ellipsis" />} readOnly={true} />)}
                            </Upload>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    }
}

const ExtendServerConfig = Form.create()(ServerConfig);
export default connect((state: IObject) => ({ state }))(ExtendServerConfig);