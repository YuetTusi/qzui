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

interface Prop extends FormComponentProps {
	/**
	 * 隐藏/显示
	 */
	visible: boolean;
	/**
	 * 父级分类id
	 */
	sortId: string;
	/**
	 * 数据
	 */
	data?: string;
	/**
	 * 保存handle
	 */
	saveHandle: (sortId: string, word: string) => void;
	/**
	 * 关闭handle
	 */
	closeHandle: () => void;
}

/**
 * 关键词弹框
 * @param props
 */
const KeyWordModal = Form.create<Prop>()((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	const formSubmit = () => {
		validateFields((err, values: any) => {
			if (!err) {
				props.saveHandle(props.sortId, values.value);
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
			title={helper.isNullOrUndefined(props.data) ? '添加关键词' : '编辑关键词'}
			maskClosable={false}
			destroyOnClose={true}>
			<Form {...formItemLayout}>
				<Item label="内容">
					{getFieldDecorator('value', {
						rules: [{ required: true, message: '请填写内容' }]
						// initialValue: props.data?.sort
					})(<Input />)}
				</Item>
			</Form>
		</Modal>
	);
});

export default KeyWordModal;
