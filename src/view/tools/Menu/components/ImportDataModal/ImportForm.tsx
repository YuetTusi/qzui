import React, { forwardRef, ReactElement } from 'react';
import { ipcRenderer, OpenDialogReturnValue, FileFilter } from 'electron';
import moment from 'moment';
import debounce from 'lodash/debounce';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Select, { OptionProps } from 'antd/lib/select';
import Form, { FormComponentProps } from 'antd/lib/form';
import CCaseInfo from '@src/schema/CCaseInfo';
import { ImportTypes } from '@src/schema/ImportType';
import { IMEI } from '@src/utils/regex';

interface Prop extends FormComponentProps {
	/**
	 * 导入类型
	 */
	type: ImportTypes;
	/**
	 * 案件下拉数据
	 */
	caseList: CCaseInfo[];
}

const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 19 }
};

/**
 * 按输入项过滤Option
 * @param inputValue 输入值
 * @param option Option项
 * @returns 输入项关键字存在为true
 */
const onFilterOption = (inputValue: string, option: ReactElement<OptionProps>) => {
	const { children } = option.props;
	return (children as string).includes(inputValue);
};

/**
 * 根据导入类型返回文件过滤类型
 * @param type 导入类型
 */
const getFilters = (type: ImportTypes) => {
	let filter: FileFilter[] | undefined;

	switch (type) {
		case ImportTypes.IOSMirror:
			filter = [{ name: 'iOS镜像', extensions: ['tar', 'zip'] }];
			break;
		default:
			filter = undefined;
			break;
	}
	return filter;
};

/**
 * 根据导入类型返回选择目录还是文件
 * @param type 导入类型
 */
const getProperties = (type: ImportTypes) => {
	let properties: Array<'openFile' | 'openDirectory'> = [];
	switch (type) {
		case ImportTypes.IOSMirror:
			properties = ['openFile'];
			break;
		default:
			properties = ['openDirectory'];
			break;
	}
	return properties;
};

/**
 * 导入表单
 */
const ImportForm = Form.create<Prop>({ name: 'importForm' })(
	forwardRef<Form, Prop>((props: Prop) => {
		const { type } = props;
		const { getFieldDecorator } = props.form;

		/**
		 * 目录&文件选择框handle
		 */
		const selectPackageDirHandle = debounce(
			(field: string) => {
				const { resetFields, setFieldsValue } = props.form;
				ipcRenderer
					.invoke('open-dialog', {
						properties: getProperties(type),
						filters: getFilters(type)
					})
					.then((val: OpenDialogReturnValue) => {
						resetFields([field]);
						if (val.filePaths && val.filePaths.length > 0) {
							setFieldsValue({ [field]: val.filePaths[0] });
						}
					});
			},
			500,
			{ leading: true, trailing: false }
		);

		/**
		 * SD卡数据选择框handle
		 */
		const selectSdCardDirHandle = debounce(
			(field: string) => {
				const { resetFields, setFieldsValue } = props.form;
				ipcRenderer
					.invoke('open-dialog', { properties: ['openDirectory', 'createDirectory'] })
					.then((val: OpenDialogReturnValue) => {
						resetFields([field]);
						if (val.filePaths && val.filePaths.length > 0) {
							setFieldsValue({ [field]: val.filePaths[0] });
						}
					});
			},
			500,
			{ leading: true, trailing: false }
		);

		/**
		 * 绑定案件下拉数据
		 */
		const bindCaseSelect = () => {
			const { caseList } = props;
			const { Option } = Select;
			return caseList.map((opt: CCaseInfo, i) => {
				const [caseName] = opt.m_strCaseName.split('_');
				return (
					<Option value={opt._id} key={`C_${i}`}>
						{`${caseName}（${moment(opt.createdAt).format('YYYY-M-D HH:mm:ss')}）`}
					</Option>
				);
			});
		};

		return (
			<Form layout="horizontal" {...formItemLayout}>
				<Row>
					<Col span={24}>
						<Item label="案件名称">
							{getFieldDecorator('caseId', {
								rules: [
									{
										required: true,
										message: '请选择案件'
									}
								]
							})(
								<Select
									filterOption={onFilterOption}
									showSearch={true}
									notFoundContent="暂无数据"
									placeholder="选择案件，可输入案件名称查找">
									{bindCaseSelect()}
								</Select>
							)}
						</Item>
					</Col>
				</Row>
				<Row>
					<Col span={24}>
						<Item label="数据位置">
							{getFieldDecorator('packagePath', {
								rules: [{ required: true, message: '请选择第三方数据位置' }]
							})(
								<Input
									addonAfter={
										<Icon
											type="ellipsis"
											onClick={() => selectPackageDirHandle('packagePath')}
										/>
									}
									readOnly={true}
									placeholder="第三方数据所在位置"
									onClick={() => selectPackageDirHandle('packagePath')}
								/>
							)}
						</Item>
					</Col>
				</Row>
				<Row style={{ display: type === ImportTypes.AndroidData ? 'block' : 'none' }}>
					<Col span={24}>
						<Item label="SD卡数据位置">
							{getFieldDecorator('sdCardPath')(
								<Input
									addonAfter={
										<Icon
											type="ellipsis"
											onClick={() => selectSdCardDirHandle('sdCardPath')}
										/>
									}
									readOnly={true}
									placeholder="SD卡数据位置"
									onClick={() => selectSdCardDirHandle('sdCardPath')}
								/>
							)}
						</Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
							{getFieldDecorator('mobileName', {
								rules: [
									{
										required: true,
										message: '请填写手机名称'
									}
								]
							})(<Input maxLength={20} />)}
						</Item>
					</Col>
					<Col span={12}>
						<Item label="手机持有人" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
							{getFieldDecorator('mobileHolder', {
								rules: [
									{
										required: true,
										message: '请填写持有人'
									}
								]
							})(<Input placeholder="持有人姓名" maxLength={20} />)}
						</Item>
					</Col>
				</Row>
				<Row>
					<Col span={24}>
						<Item label="备注">
							{getFieldDecorator('note', {
								initialValue: '',
								rules: [
									{
										required: true,
										message: '请填写备注'
									}
								]
							})(<Input />)}
						</Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Item label="IMEI" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
							{getFieldDecorator('mobileNo', {
								rules: [
									{
										required: true,
										message: '请填写IMEI'
									},
									{
										pattern: IMEI,
										message: '15位数字'
									}
								]
							})(<Input maxLength={15} placeholder="15位数字" />)}
						</Item>
					</Col>
					<Col span={12}>
						<div style={{ color: 'red', fontSize: '12px', lineHeight: '40px' }}>
							不填写IMEI会影响生成BCP文件
						</div>
					</Col>
				</Row>
			</Form>
		);
	})
);

export default ImportForm;
