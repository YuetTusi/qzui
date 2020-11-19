import path from 'path';
import React, { useState } from 'react';
import debounce from 'lodash/debounce';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import { useMount } from '@src/hooks';
import Title from '@src/components/title/Title';
import { Prop } from './componentType';
import { IP } from '@src/utils/regex';
import logger from '@src/utils/log';
import { helper } from '@utils/helper';
import { Manufaturer } from '@src/schema/socket/Manufaturer';
import './BcpConf.less';

const { Item } = Form;
const jsonPath =
	process.env['NODE_ENV'] === 'development'
		? path.join(process.cwd(), './data/manufaturer.json')
		: path.join((process.cwd(), './resources/data/manufaturer.json'));

/**
 * 更新设备软硬件数据到LocalStorage
 * @param {Manufacturer} data 设备软硬件
 */
const updateToLocalStorage = (data: Manufaturer) => {
	localStorage.setItem('manufacturer', data?.manufacturer ?? '');
	localStorage.setItem('security_software_orgcode', data?.security_software_orgcode ?? '');
	localStorage.setItem('materials_name', data?.materials_name ?? '');
	localStorage.setItem('materials_model', data?.materials_model ?? '');
	localStorage.setItem('materials_hardware_version', data?.materials_hardware_version ?? '');
	localStorage.setItem('materials_software_version', data?.materials_software_version ?? '');
	localStorage.setItem('materials_serial', data?.materials_serial ?? '');
	localStorage.setItem('ip_address', data?.ip_address ?? '');
};

/**
 * 设备生成厂商、软硬件版本、序列号等信息
 * 数据存储在manufaturer.json文件中
 */
const BcpConf = Form.create<Prop>({ name: 'bcpConfForm' })((props: Prop) => {
	const { getFieldDecorator } = props.form;

	const [data, setData] = useState<Manufaturer>({});

	/**
	 * 读取数据
	 */
	const loadData = async () => {
		let exist = false;
		try {
			exist = await helper.existFile(jsonPath);
			if (exist) {
				const next = await helper.readManufaturer();
				setData(next);
			} else {
				setData({});
			}
		} catch (error) {
			message.error('读取JSON数据失败');
			logger.error(
				`读取manufaturer.json失败 @view/settings/BcpConf/BcpConf.tsx：${error.message}`
			);
		}
	};

	/**
	 * 保存submit
	 */
	const formSubmit = debounce(
		() => {
			const { validateFields } = props.form;
			validateFields((err, values: Manufaturer) => {
				if (!err) {
					helper
						.writeJSONfile(jsonPath, values)
						.then(() => {
							updateToLocalStorage(values);
							message.destroy();
							message.success('保存成功');
						})
						.catch((err) => {
							message.error(`保存失败：${err.message}`);
						});
				}
			});
		},
		500,
		{ leading: true, trailing: false }
	);

	const formItemLayout = {
		labelCol: { span: 4 },
		wrapperCol: { span: 18 }
	};

	useMount(loadData);

	return (
		<div className="bcp-conf-root">
			<Title
				onOk={() => {
					formSubmit();
				}}
				okText="保存">
				软硬件信息配置
			</Title>
			<div className="scroll-box">
				<div className="form-box">
					<Form {...formItemLayout}>
						<Item label="制造商名称">
							{getFieldDecorator('manufacturer', {
								initialValue: data.manufacturer
							})(<Input />)}
						</Item>
						<Item label="厂商组织机构代码">
							{getFieldDecorator('security_software_orgcode', {
								initialValue: data.security_software_orgcode
							})(<Input />)}
						</Item>
						<Item label="采集设备名称">
							{getFieldDecorator('materials_name', {
								initialValue: data.materials_name
							})(<Input />)}
						</Item>
						<Item label="设备型号">
							{getFieldDecorator('materials_model', {
								initialValue: data.materials_model
							})(<Input />)}
						</Item>
						<Item label="设备硬件版本号">
							{getFieldDecorator('materials_hardware_version', {
								initialValue: data.materials_hardware_version
							})(<Input />)}
						</Item>
						<Item label="设备软件版本号">
							{getFieldDecorator('materials_software_version', {
								initialValue: data.materials_software_version
							})(<Input />)}
						</Item>
						<Item label="设备序列号">
							{getFieldDecorator('materials_serial', {
								initialValue: data.materials_serial
							})(<Input />)}
						</Item>
						<Item label="采集点IP">
							{getFieldDecorator('ip_address', {
								initialValue: data.ip_address,
								rules: [{ pattern: IP, message: '请输入合法的IP地址' }]
							})(<Input maxLength={15} />)}
						</Item>
					</Form>
				</div>
			</div>
		</div>
	);
});

export default BcpConf;
