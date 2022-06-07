import React, { forwardRef } from 'react';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';

const { devText } = helper.readConf();

interface Prop extends FormComponentProps {
	/**
	 * 表单数据
	 */
	data: DeviceType;
}

const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 16 }
};

/**
 * 编辑设备表单
 */
const EditForm = Form.create<Prop>({ name: 'deviceEditForm' })(
	forwardRef<Form, Prop>((props: Prop) => {
		const { getFieldDecorator } = props.form;

		return (
			<Form {...formItemLayout}>
				<Item label={`${devText ?? '手机'}持有人`}>
					{getFieldDecorator('mobileHolder', {
						initialValue: props.data.mobileHolder
					})(<Input />)}
				</Item>
				<Item label={`${devText ?? '手机'}编号`}>
					{getFieldDecorator('mobileNo', {
						initialValue: props.data.mobileNo,
					})(<Input maxLength={3} />)}
				</Item>
				<Item label="备注">
					{getFieldDecorator('note', {
						initialValue: props.data.note
					})(<Input maxLength={100} />)}
				</Item>
			</Form>
		);
	})
);

export default EditForm;
