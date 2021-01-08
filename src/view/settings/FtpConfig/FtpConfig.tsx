import path from 'path';
import React, { Component } from 'react';
import { connect } from 'dva';
import Form, { FormComponentProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Title from '@src/components/title/Title';
import { StoreComponent } from '@type/model';
import { IP, Port } from '@src/utils/regex';
import { FtpStoreState } from '@src/model/settings/FtpConfig/FtpConfig';
import { helper } from '@src/utils/helper';
import './FtpConfig.less';

const appRootPath = process.cwd();
let ftpJsonPath = appRootPath; //FTP_JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	ftpJsonPath = path.join(appRootPath, 'data/ftp.json');
} else {
	ftpJsonPath = path.join(appRootPath, 'resources/data/ftp.json');
}

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
			dispatch({ type: 'ftpConfig/queryConfig', payload: ftpJsonPath });
		}
		saveHandle = () => {
			const { dispatch } = this.props;
			const { validateFields } = this.props.form;
			validateFields((err, values: FtpStoreState) => {
				if (!err) {
					values.serverPath = path.join('/', values.serverPath);
					dispatch({
						type: 'ftpConfig/saveConfig',
						payload: { savePath: ftpJsonPath, data: values }
					});
				}
			});
		};
		render(): JSX.Element {
			const { ip, port, username, password, serverPath } = this.props.ftpConfig;
			const { getFieldDecorator } = this.props.form;
			return (
				<div className="server-config">
					<Title okText="确定" onOk={this.saveHandle}>
						FTP配置
					</Title>
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
									})(<Input placeholder="IP地址，如：192.168.1.10" />)}
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
									})(<Input placeholder="FTP服务器用户名" />)}
								</Form.Item>
								<Form.Item label="口令">
									{getFieldDecorator('password', {
										rules: [{ required: true, message: '请填写口令' }],
										initialValue: password
									})(<Input.Password placeholder="FTP服务器口令" />)}
								</Form.Item>
								<Form.Item label="上传目录">
									{getFieldDecorator('serverPath', {
										rules: [{ required: true, message: '请填写上传目录' }],
										initialValue: helper.isNullOrUndefinedOrEmptyString(
											serverPath
										)
											? '/'
											: serverPath
									})(<Input placeholder="上传所在目录路径" />)}
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
