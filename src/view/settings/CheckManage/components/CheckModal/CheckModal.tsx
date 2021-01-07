import path from 'path';
import React, { useEffect, useState } from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Switch from 'antd/lib/switch';
import { DataMode } from '@src/schema/DataMode';
import { LocalStoreKey } from '@utils/localStore';
import { IP, Port } from '@utils/regex';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { Prop } from './componentProps';

const appRootPath = process.cwd();
const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 15 }
};
let checkJsonPath = appRootPath; //点验JSON文件路径
let platformJsonPath = appRootPath; //平台JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	checkJsonPath = path.join(appRootPath, 'data/check.json');
	platformJsonPath = path.join(appRootPath, 'data/platform.json');
} else {
	checkJsonPath = path.join(appRootPath, 'resources/data/check.json');
	platformJsonPath = path.join(appRootPath, 'resources/data/platform.json');
}

/**
 * 点验配置窗口
 */
const CheckModal = Form.create<Prop>({ name: 'checkForm' })((props: Prop) => {
	const { getFieldDecorator } = props.form;

	const [isCheck, setIsCheck] = useState(false);
	const [ip, setIP] = useState('127.0.0.1');
	const [port, setPort] = useState('21');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [serverPath, setServerPath] = useState('\\');

	useEffect(() => {
		(async () => {
			let exist = await helper.existFile(checkJsonPath);
			if (exist) {
				let data = await helper.readJSONFile(checkJsonPath);
				setIsCheck(data.isCheck ?? false);
				setIP(data.ip ?? '127.0.0.1');
				setPort(data.port ?? '21');
				setIsCheck(data.isCheck ?? false);
				setUsername(data.username ?? '');
				setPassword(data.password ?? '');
				setServerPath(data.serverPath ?? '\\');
			} else {
				setIsCheck(false);
			}
		})();
	}, [props.visible]);

	/**
	 * 互斥保存平台数据文件
	 * @param isCheck 是否开启点验模式
	 */
	const togglePlatformJson = async (isCheck: boolean) => {
		let next: Record<string, any> = {};
		if (isCheck) {
			try {
				//若平台JSON文件存在，关闭警综模式
				let exist = await helper.existFile(platformJsonPath);
				if (exist) {
					next = await helper.readJSONFile(platformJsonPath);
					next.usePlatform = false;
					await helper.writeJSONfile(platformJsonPath, next);
				}
			} catch (error) {
				log.error(
					`更新点验JSON文件失败 @view/settings/CheckManage/CheckForm/togglePlatformJson:${error.message}`
				);
			}
		}
	};

	/**
	 * 写入check.json文件
	 * @param savePath CheckJSON路径
	 * @param data 数据
	 */
	const writeCheckJson = async (savePath: string, data: any) => {
		try {
			await helper.writeJSONfile(savePath, data);
			await togglePlatformJson(isCheck); //若开启点验版本，关闭警综平台模式
			message.destroy();
			message.success('保存成功');
			props.closeHandle();
		} catch (error) {
			message.error('保存失败');
		}
	};

	const switchChange = () => setIsCheck((prev) => !prev);

	/**
	 * 保存handle
	 */
	const saveHandle = () => {
		const { validateFields } = props.form;

		if (isCheck) {
			validateFields((err, values) => {
				if (!err) {
					values.serverPath = path.join('/', values.serverPath);
					writeCheckJson(checkJsonPath, { ...values, isCheck });
				}
			});
		} else {
			const nextServerPath = path.join('/', serverPath);
			writeCheckJson(checkJsonPath, {
				isCheck,
				ip,
				port,
				username,
				password,
				serverPath: nextServerPath
			});
		}
		localStorage.setItem(
			LocalStoreKey.DataMode,
			isCheck ? DataMode.Check.toString() : DataMode.Self.toString()
		);
	};

	return (
		<Modal
			footer={[
				<Button onClick={props.closeHandle} type="default" icon="close-circle">
					取消
				</Button>,
				<Button onClick={saveHandle} type="primary" icon="save">
					保存
				</Button>
			]}
			width={520}
			onCancel={props.closeHandle}
			visible={props.visible}
			maskClosable={false}
			destroyOnClose={true}
			title="点验模式设置">
			<Form {...formItemLayout}>
				<Item label="点验模式">
					<Switch
						checkedChildren="开"
						unCheckedChildren="关"
						checked={isCheck}
						onChange={switchChange}
					/>
				</Item>
				<Item label="FTP IP">
					{getFieldDecorator('ip', {
						rules: [
							{ required: isCheck, message: '请填写FTP IP' },
							{ pattern: IP, message: '请填写合法的IP地址' }
						],
						initialValue: ip
					})(<Input disabled={!isCheck} placeholder="IP地址，如：192.168.1.10" />)}
				</Item>
				<Item label="FTP端口">
					{getFieldDecorator('port', {
						rules: [
							{ required: isCheck, message: '请填写FTP端口' },
							{ pattern: Port, message: '5位以内的数字' }
						],
						initialValue: port
					})(<Input disabled={!isCheck} placeholder="数字, 5位以内" />)}
				</Item>
				<Item label="用户名">
					{getFieldDecorator('username', {
						rules: [{ required: isCheck, message: '请填写用户名' }],
						initialValue: username
					})(<Input disabled={!isCheck} placeholder="FTP服务器用户名" />)}
				</Item>
				<Item label="口令">
					{getFieldDecorator('password', {
						rules: [{ required: isCheck, message: '请填写口令' }],
						initialValue: password
					})(<Input.Password disabled={!isCheck} placeholder="FTP服务器口令" />)}
				</Item>
				<Item label="上传目录">
					{getFieldDecorator('serverPath', {
						rules: [{ required: isCheck, message: '请填写上传目录' }],
						initialValue: helper.isNullOrUndefinedOrEmptyString(serverPath)
							? '/'
							: serverPath
					})(<Input disabled={!isCheck} placeholder="上传所在目录路径" />)}
				</Item>
			</Form>
		</Modal>
	);
});

CheckModal.defaultProps = {
	visible: false
};

export default CheckModal;
