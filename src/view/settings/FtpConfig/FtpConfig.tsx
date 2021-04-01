import path from 'path';
import React, { useState, MouseEvent } from 'react';
import debounce from 'lodash/debounce';
import classnames from 'classnames';
import FtpClient from 'ftp';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Switch from 'antd/lib/switch';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import Title from '@src/components/title/Title';
import { IP, Port } from '@src/utils/regex';
import { helper } from '@utils/helper';
import { useMount } from '@src/hooks';
import logger from '@utils/log';
import FtpAlert from './FtpAlert';
import { Prop, FormValue } from './componentTypes';
import './FtpConfig.less';

const appRootPath = process.cwd();
let ftpJsonPath = appRootPath; //FTP_JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	ftpJsonPath = path.join(appRootPath, 'data/ftp.json');
} else {
	ftpJsonPath = path.join(appRootPath, 'resources/data/ftp.json');
}

const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 18 }
};

/**
 * 检测FTP连接
 * @param config 表单配置
 * @returns Promise
 */
const checkFtpConnect = debounce(
	(config: FormValue) => {
		let client = new FtpClient();
		return new Promise((resolve, reject) => {
			client.once('error', (err) => reject(err));
			client.once('ready', () => resolve(true));
			client.connect({
				host: config.ip,
				user: config.username,
				password: config.password
			});
		});
	},
	400,
	{ leading: true, trailing: false }
);

const FtpConfig = Form.create<Prop>({ name: 'ftpForm' })((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;
	const [ftpData, setFtpData] = useState<null | FormValue>(null);
	const [checkState, setCheckState] = useState<'loading' | 'error' | 'success' | 'hidden'>(
		'hidden'
	);

	useMount(() => {
		readFtpJson(ftpJsonPath);
	});

	const readFtpJson = async (jsonPath: string) => {
		try {
			const exist: boolean = await helper.existFile(jsonPath);
			if (exist) {
				let data = await helper.readJSONFile(jsonPath);
				setFtpData(data);
			} else {
				setFtpData({
					enable: false,
					ip: '127.0.0.1',
					port: 0,
					username: '',
					password: '',
					serverPath: '/'
				});
			}
		} catch (error) {
			logger.error(
				`查询FTP配置失败: @model/settings/FtpConfig/queryConfig, 消息:${error.message}`
			);
		}
	};

	const writeFtpJson = async (jsonPath: string, data: FormValue) => {
		try {
			await helper.writeJSONfile(jsonPath, {
				enable: data?.enable ?? false,
				ip: data?.ip ?? '127.0.0.1',
				port: data?.port ? Number(data.port) : 0,
				username: data?.username ?? '',
				password: data?.password ?? '',
				serverPath: data?.serverPath ?? '/'
			});
			message.success('保存成功');
		} catch (error) {
			logger.error(
				`保存FTP配置失败: @model/settings/FtpConfig/queryConfig, 消息:${error.message}`
			);
			message.error('保存失败');
		}
	};

	const enableChange = (checked: boolean) => {
		setFtpData((prev) => ({
			...prev!,
			enable: checked
		}));
		if (!checked) {
			setCheckState('hidden');
		}
	};

	const saveHandle = () => {
		if (ftpData?.enable) {
			validateFields((err, values: FormValue) => {
				if (!err) {
					values.serverPath = path.join('/', values.serverPath);
					writeFtpJson(ftpJsonPath, { ...values, enable: ftpData.enable });
				}
			});
		} else {
			writeFtpJson(ftpJsonPath, { ...ftpData!, enable: ftpData!.enable ?? false });
		}
	};

	const checkHandle = (e: MouseEvent<HTMLButtonElement>) => {
		if (ftpData?.enable) {
			validateFields((err, values: FormValue) => {
				if (!err) {
					setCheckState('loading');
					checkFtpConnect(values)!
						.then(() => {
							setCheckState('success');
						})
						.catch((err) => {
							setCheckState('error');
						});
				}
			});
		} else {
			message.info('请启用FTP配置');
		}
	};

	return (
		<div className="server-config">
			<Title okText="确定" onOk={saveHandle}>
				FTP配置
			</Title>
			<div className="server-cfg-panel">
				<div className="form-panel">
					<Form {...formItemLayout} layout="horizontal">
						<Item label="启用FTP">
							<Switch
								checked={ftpData?.enable ?? false}
								onChange={enableChange}
								checkedChildren="开"
								unCheckedChildren="关"
							/>
							<em className={classnames({ enable: ftpData?.enable ?? false })}>
								开启后，自动解析生成BCP文件将自动上传至FTP服务器
							</em>
						</Item>
						<Item label="FTP IP">
							{getFieldDecorator('ip', {
								rules: [
									{ required: ftpData?.enable, message: '请填写FTP IP' },
									{ pattern: IP, message: '请填写合法的IP地址' }
								],
								initialValue: ftpData?.ip ?? ''
							})(
								<Input
									disabled={!ftpData?.enable}
									placeholder="IP地址，如：192.168.1.10"
									maxLength={15}
								/>
							)}
						</Item>
						<Item label="FTP端口">
							{getFieldDecorator('port', {
								rules: [
									{ required: ftpData?.enable, message: '请填写FTP端口' },
									{ pattern: Port, message: '5位以内的数字' }
								],
								initialValue: ftpData?.port ?? 0
							})(
								<Input
									disabled={!ftpData?.enable}
									maxLength={5}
									placeholder="数字, 5位以内"
								/>
							)}
						</Item>
						<Item label="用户名">
							{getFieldDecorator('username', {
								rules: [{ required: false, message: '请填写用户名' }],
								initialValue: ftpData?.username ?? ''
							})(<Input disabled={!ftpData?.enable} placeholder="FTP服务器用户名" />)}
						</Item>
						<Item label="口令">
							{getFieldDecorator('password', {
								rules: [{ required: false, message: '请填写口令' }],
								initialValue: ftpData?.password ?? ''
							})(
								<Input.Password
									disabled={!ftpData?.enable}
									placeholder="FTP服务器口令"
								/>
							)}
						</Item>
						<Item label="上传目录">
							{getFieldDecorator('serverPath', {
								rules: [{ required: ftpData?.enable, message: '请填写上传目录' }],
								initialValue: helper.isNullOrUndefinedOrEmptyString(
									ftpData?.serverPath
								)
									? '/'
									: ftpData?.serverPath
							})(
								<Input disabled={!ftpData?.enable} placeholder="上传所在目录路径" />
							)}
						</Item>
						<Item label="测试连接">
							<Row>
								<Col span={4}>
									<Button
										onClick={checkHandle}
										disabled={!ftpData?.enable}
										type="default">
										测试FTP连接
									</Button>
								</Col>
								<Col span={20}>
									<FtpAlert type={checkState} />
								</Col>
							</Row>
						</Item>
					</Form>
				</div>
			</div>
		</div>
	);
});

export default FtpConfig;
