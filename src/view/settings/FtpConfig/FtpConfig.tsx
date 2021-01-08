import path from 'path';
import React, { Component } from 'react';
import { connect } from 'dva';
import Switch from 'antd/lib/switch';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Title from '@src/components/title/Title';
import { IP, Port } from '@src/utils/regex';
import { FtpStoreState } from '@src/model/settings/FtpConfig/FtpConfig';
import { helper } from '@src/utils/helper';
import { Prop, State } from './componentTypes';
import './FtpConfig.less';
import logger from '@src/utils/log';

const appRootPath = process.cwd();
let ftpJsonPath = appRootPath; //FTP_JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	ftpJsonPath = path.join(appRootPath, 'data/ftp.json');
} else {
	ftpJsonPath = path.join(appRootPath, 'resources/data/ftp.json');
}

const formItemLayout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 18 }
};

/**
 * @description FTP服务器配置
 * BcpFtp.exe 127.0.0.1 21 user pwd / file1 file2 file3
 */
let ExtendFtpConfig = Form.create<Prop>({ name: 'ftp' })(
	class FtpConfig extends Component<Prop, State> {
		constructor(props: any) {
			super(props);
			this.state = { enable: false };
		}
		componentDidMount() {
			const { dispatch } = this.props;
			const { enable } = this.props.ftpConfig;
			dispatch({ type: 'ftpConfig/queryConfig', payload: ftpJsonPath });
			this.readFtpJson(ftpJsonPath);
		}
		enableChange = (checked: boolean) => {
			this.setState({
				enable: checked
			});
		};
		saveHandle = () => {
			const { dispatch, ftpConfig } = this.props;
			const { enable } = this.state;
			const { validateFields } = this.props.form;

			if (enable) {
				validateFields((err, values: FtpStoreState) => {
					if (!err) {
						values.serverPath = path.join('/', values.serverPath);
						dispatch({
							type: 'ftpConfig/saveConfig',
							payload: { savePath: ftpJsonPath, data: { ...values, enable } }
						});
					}
				});
			} else {
				dispatch({
					type: 'ftpConfig/saveConfig',
					payload: { savePath: ftpJsonPath, data: { ...ftpConfig, enable } }
				});
			}
		};
		readFtpJson = async (jsonPath: string) => {
			try {
				const exist: boolean = await helper.existFile(jsonPath);
				if (exist) {
					let ftp = await helper.readJSONFile(jsonPath);
					this.setState({ enable: ftp.enable ?? false });
				} else {
					this.setState({ enable: false });
				}
			} catch (error) {
				logger.error(
					`查询FTP配置失败: @model/settings/FtpConfig/queryConfig, 消息:${error.message}`
				);
			}
		};
		render(): JSX.Element {
			const { ip, port, username, password, serverPath } = this.props.ftpConfig;
			const { getFieldDecorator } = this.props.form;
			const { enable } = this.state;
			return (
				<div className="server-config">
					<Title okText="确定" onOk={this.saveHandle}>
						FTP配置
					</Title>
					<div className="server-cfg-panel">
						<div className="form-panel">
							<Form {...formItemLayout} layout="horizontal">
								<Form.Item label="启用FTP">
									<Switch
										checked={enable}
										onChange={this.enableChange}
										checkedChildren="开"
										unCheckedChildren="关"
									/>
								</Form.Item>
								<Form.Item label="FTP IP">
									{getFieldDecorator('ip', {
										rules: [
											{ required: enable, message: '请填写FTP IP' },
											{ pattern: IP, message: '请填写合法的IP地址' }
										],
										initialValue: ip
									})(
										<Input
											disabled={!enable}
											placeholder="IP地址，如：192.168.1.10"
										/>
									)}
								</Form.Item>
								<Form.Item label="FTP端口">
									{getFieldDecorator('port', {
										rules: [
											{ required: enable, message: '请填写FTP端口' },
											{ pattern: Port, message: '5位以内的数字' }
										],
										initialValue: port
									})(<Input disabled={!enable} placeholder="数字, 5位以内" />)}
								</Form.Item>
								<Form.Item label="用户名">
									{getFieldDecorator('username', {
										rules: [{ required: enable, message: '请填写用户名' }],
										initialValue: username
									})(<Input disabled={!enable} placeholder="FTP服务器用户名" />)}
								</Form.Item>
								<Form.Item label="口令">
									{getFieldDecorator('password', {
										rules: [{ required: enable, message: '请填写口令' }],
										initialValue: password
									})(
										<Input.Password
											disabled={!enable}
											placeholder="FTP服务器口令"
										/>
									)}
								</Form.Item>
								<Form.Item label="上传目录">
									{getFieldDecorator('serverPath', {
										rules: [{ required: enable, message: '请填写上传目录' }],
										initialValue: helper.isNullOrUndefinedOrEmptyString(
											serverPath
										)
											? '/'
											: serverPath
									})(<Input disabled={!enable} placeholder="上传所在目录路径" />)}
								</Form.Item>
							</Form>
						</div>
					</div>
				</div>
			);
		}
	}
);

export default connect((state: any) => ({ ftpConfig: state.ftpConfig }))(ExtendFtpConfig);
