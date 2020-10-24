import React from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import { SortData } from '../SortModal/SortModal';

const { Item } = Form;

const formItemLayout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 16 }
};

interface PackageData {
	/**
	 * id
	 */
	id: string;
	/**
	 * App名称
	 */
	app: string;
	/**
	 * 包名
	 */
	package: string;
}

interface Prop extends FormComponentProps {
	/**
	 * 隐藏/显示
	 */
	visible: boolean;
	/**
	 * 父级分类
	 */
	sort: SortData;
	/**
	 * 数据
	 */
	data?: PackageData;
	/**
	 * 保存handle
	 */
	saveHandle: (sort: SortData, data: PackageData) => void;
	/**
	 * 关闭handle
	 */
	closeHandle: () => void;
}

/**
 * App弹框
 * @param props
 */
const PackageModal = Form.create<Prop>()((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	const formSubmit = () => {
		validateFields((err, values: PackageData) => {
			if (!err) {
				const next: PackageData = {
					...values,
					id: props.data?.id!
				};
				props.saveHandle(props.sort, next);
			}
		});
	};

	return (
		<Modal
			visible={props.visible}
			footer={[
				<Button onClick={() => props.closeHandle()} type="default" icon="close-circle">
					取消
				</Button>,
				<Button onClick={() => formSubmit()} type="primary" icon="save">
					保存
				</Button>
			]}
			onCancel={props.closeHandle}
			title={
				helper.isNullOrUndefined(props.data?.id)
					? `添加「${props.sort?.sort}」应用`
					: `编辑「${props.sort?.sort}」应用`
			}
			maskClosable={false}
			destroyOnClose={true}>
			<Form {...formItemLayout}>
				<Item label="App名称">
					{getFieldDecorator('app', {
						rules: [{ required: true, message: '请填写应用名称' }],
						initialValue: props.data?.app
					})(<Input />)}
				</Item>
				<Item label="App包名">
					{getFieldDecorator('package', {
						rules: [{ required: true, message: '请填写包名' }],
						initialValue: props.data?.package
					})(<Input />)}
				</Item>
			</Form>
		</Modal>
	);
});

export { PackageData };
export default PackageModal;
