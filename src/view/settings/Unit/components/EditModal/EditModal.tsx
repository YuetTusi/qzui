import React, { MouseEvent } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import { useSubscribe } from '@src/hooks';
import { FormValue, Prop } from './componentTypes';

const { Item } = Form;

/**
 * 添加/编辑单位框
 */
const EditModal = Form.create<Prop>({ name: 'editForm' })((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	const insertUnitResultHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
		if (result.success) {
			props.closeHandle(true);
			message.success('保存成功');
		} else {
			message.error('保存失败');
		}
	};

	useSubscribe('insert-unit-result', insertUnitResultHandle);

	const saveHandle = (e: MouseEvent<HTMLElement>) => {
		validateFields((err, values: FormValue) => {
			if (!err) {
				ipcRenderer.send('insert-unit', JSON.stringify(values));
			}
		});
	};

	return (
		<Modal
			visible={props.visible}
			footer={[
				<Button icon="close-circle" onClick={() => props.closeHandle(false)}>
					取消
				</Button>,
				<Button onClick={saveHandle} type="primary" icon="save">
					保存
				</Button>
			]}
			onCancel={() => props.closeHandle(false)}
			destroyOnClose={true}
			title="添加单位">
			<Form>
				<Item label="单位名称">
					{getFieldDecorator('pcsName', {
						rules: [{ required: true, message: '请填写单位名称' }]
					})(<Input />)}
				</Item>
			</Form>
		</Modal>
	);
});

EditModal.defaultProps = {
	visible: false,
	closeHandle: () => {}
};

export default EditModal;
