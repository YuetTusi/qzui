import React from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { ArmyUnitEntity } from '@src/schema/socket/ArmyUnitEntity';
import log from '@utils/log';

const { Item } = Form;

interface Prop extends FormComponentProps {
	/**
	 * 显示/隐藏
	 */
	visible: boolean;

	saveHandle: (data: ArmyUnitEntity) => void;
	/**
	 * 关闭handle
	 */
	closeHandle: () => void;
}

/**
 * 添加/编辑框
 */
const EditModal = Form.create<Prop>({ name: 'editForm' })((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	const saveClick = () => {
		validateFields(async (err, values: ArmyUnitEntity) => {
			if (!err) {
				try {
					props.saveHandle(values);
					// const db = new Db<ArmyUnitEntity>(TableName.ArmyUnit);
					// db.insert(values);
					// message.success('添加成功');
					// props.closeHandle(true);
				} catch (error) {
					message.error('保存失败');
					log.error(
						`保存采集单位失败 @view/settings/ArmyUnit/EditModal: ${error.message}`
					);
				}
			}
		});
	};

	return (
		<Modal
			footer={[
				<Button onClick={() => props.closeHandle()} type="default" icon="close-circle">
					取消
				</Button>,
				<Button type="primary" icon="save" onClick={saveClick}>
					保存
				</Button>
			]}
			onCancel={() => props.closeHandle()}
			visible={props.visible}
			title="添加单位"
			destroyOnClose={true}>
			<Item label="单位名称">
				{getFieldDecorator('unitName', {
					rules: [{ required: true, message: '请填写单位名称' }]
				})(<Input />)}
			</Item>
		</Modal>
	);
});

export default EditModal;
