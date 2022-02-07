import path from 'path';
import React, { useState } from 'react';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import Title from '@src/components/title/Title';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { IP, Port } from '@utils/regex';
import { LocalStoreKey } from '@utils/localStore';
import { useMount } from '@src/hooks';
import { send } from '@src/service/tcpServer';
import { DataMode } from '@src/schema/DataMode';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { installPlugin } from './installPlugin';
import { Prop, FormValue } from './componentType';
import './Platform.less';

const appRootPath = process.cwd();
const { Item } = Form;
let platformJsonPath = appRootPath; //平台JSON文件路径
let checkJsonPath = appRootPath; //点验JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	platformJsonPath = path.join(appRootPath, 'data/platform.json');
	checkJsonPath = path.join(appRootPath, 'data/check.json');
} else {
	platformJsonPath = path.join(appRootPath, 'resources/data/platform.json');
	checkJsonPath = path.join(appRootPath, 'resources/data/check.json');
}

/**
 * 互斥保存点验数据文件
 * @param usePlatform 是否开启警综平台
 */
const toggleCheckJson = async (usePlatform: boolean) => {
	let next: Record<string, any> = {};
	if (usePlatform) {
		try {
			//若点验JSON文件存在，关闭点验模式
			let exist = await helper.existFile(checkJsonPath);
			if (exist) {
				next = await helper.readJSONFile(checkJsonPath);
				next.isCheck = false;
				await helper.writeJSONfile(checkJsonPath, next);
			}
		} catch (error) {
			log.error(
				`更新点验JSON文件失败 @view/settings/Platform/toggleCheckJson:${error.message}`
			);
		}
	}
};

/**
 * 警综平台设置
 * 与点验设置互斥（若开启警综，则自动关闭点验）
 * @param props
 */
const Platform = Form.create<Prop>({ name: 'setForm' })(({ form }: Prop) => {
	const { getFieldDecorator, validateFields, resetFields } = form;
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [data, setData] = useState<FormValue>();

	useMount(() => {
		loadJson(platformJsonPath);
	});

	const saveHandle = () => {
		if (isOpen) {
			validateFields(async (err, values: FormValue) => {
				if (!err) {
					try {
						await helper.writeJSONfile(platformJsonPath, {
							...values,
							usePlatform: isOpen
						});
						await toggleCheckJson(isOpen);
						localStorage.setItem(LocalStoreKey.DataMode, DataMode.GuangZhou.toString());
						send(SocketType.Parse, {
							type: SocketType.Parse,
							cmd: CommandType.PlatChange,
							msg: {
								...values,
								usePlatform: isOpen
							}
						});
						installPlugin(path.join(appRootPath, '../tools/plugins/bho_install.bat'));
						message.success('设置成功');
					} catch (error) {
						log.error(
							`写入平台JSON文件失败 @view/settings/Platform/saveHandle:${error.message}`
						);
						message.error('设置失败');
					}
				}
			});
		} else {
			helper
				.writeJSONfile(platformJsonPath, { ...data, usePlatform: isOpen })
				.then(() => {
					localStorage.setItem(LocalStoreKey.DataMode, DataMode.Self.toString());
					message.success('设置成功');
				})
				.catch((error) => {
					log.error(
						`写入平台JSON文件失败 @view/settings/Platform/saveHandle:${error.message}`
					);
					message.error('设置失败');
				});
			resetFields();
		}
	};

	const loadJson = async (filePath: string) => {
		try {
			let exist = await helper.existFile(platformJsonPath);
			if (exist) {
				let next: FormValue = await helper.readJSONFile(filePath);
				setData(next);
				setIsOpen((next as any).usePlatform);
			} else {
				let next = { ip: '127.0.0.1', port: '1', usePlatform: false };
				setData(next);
				helper.writeJSONfile(platformJsonPath, next);
				setIsOpen(false);
			}
		} catch (error) {
			log.error(`读取平台JSON文件失败 @view/settings/Platform/loadJson:${error.message}`);
			message.error('读取数据失败');
		} finally {
		}
	};

	const switchToggleHandle = (checked: boolean) => setIsOpen(checked);

	return (
		<div className="platform-root">
			<Title okText="保存" onOk={saveHandle}>
				警综平台设置
			</Title>
			<div className="plat-box">
				<div className="sort-root">
					<div className="sort">
						<div className="switch-bar">
							<label>警综模式：</label>
							<Switch
								checked={isOpen}
								onChange={switchToggleHandle}
								checkedChildren="开"
								unCheckedChildren="关"
							/>
						</div>
						<hr />
						<Form>
							<Item label="警综平台回传IP">
								{getFieldDecorator('ip', {
									rules: [
										{ required: isOpen, message: '请填写警综平台回传IP' },
										{
											pattern: IP,
											message: '请填写合法的IP地址'
										}
									],
									initialValue: data?.ip
								})(<Input disabled={!isOpen} />)}
							</Item>
							<Item label="警综平台回传端口">
								{getFieldDecorator('port', {
									rules: [
										{ required: isOpen, message: '请填写警综平台回传端口' },
										{
											pattern: Port,
											message: '请填合法的端口号'
										}
									],
									initialValue: data?.port
								})(<Input disabled={!isOpen} maxLength={5} />)}
							</Item>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
});

export default Platform;
