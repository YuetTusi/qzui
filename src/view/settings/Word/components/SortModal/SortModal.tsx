import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Form, { FormComponentProps } from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import { ChatData } from '../Chat/componentTypes';

const { Item } = Form;
const { Option } = Select;

const formItemLayout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 16 }
};

interface SortData<T = any> {
	/**
	 * id
	 */
	id?: string;
	/**
	 * 分类
	 */
	sort: string;
	/**
	 * 级别
	 */
	level: string;
	/**
	 * 子项
	 */
	children: T[];
}

interface Prop extends FormComponentProps {
	/**
	 * 隐藏/显示
	 */
	visible: boolean;
	/**
	 * 数据
	 */
	data: SortData;
	/**
	 * 保存handle
	 */
	saveHandle: (data: SortData) => void;
	/**
	 * 关闭handle
	 */
	closeHandle: () => void;
}

/**
 * 分类弹框
 * @param props
 */
const SortModal = Form.create<Prop>()((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	const formSubmit = () => {
		validateFields((err, values: SortData) => {
			if (!err) {
				props.saveHandle({
					id: props.data?.id,
					sort: values.sort,
					level: values.level,
					children: []
				});
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
			title={helper.isNullOrUndefined(props.data?.id) ? '添加分类' : '编辑分类'}
			maskClosable={false}
			destroyOnClose={true}>
			<Form {...formItemLayout}>
				<Item label="分类名称">
					{getFieldDecorator('sort', {
						rules: [{ required: true, message: '请填写分类名称' }],
						initialValue: props.data?.sort
					})(<Input />)}
				</Item>
				<Item label="风险级别">
					{getFieldDecorator('level', {
						rules: [{ required: true, message: '请选择风险级别' }],
						initialValue: props.data?.level
					})(
						<Select>
							<Option value="1">1</Option>
							<Option value="2">2</Option>
							<Option value="3">3</Option>
						</Select>
					)}
				</Item>
			</Form>
		</Modal>
	);
});

export { SortData };
export default SortModal;
