import { OpenDialogReturnValue, remote } from 'electron';
import React, { MouseEvent } from 'react';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { Prop } from './componentTypes';

const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 5 },
	wrapperCol: { span: 16 }
};

/**
 * 支付宝帐单保存路径弹框
 */
const AlipayOrderSaveModal = Form.create<Prop>({ name: 'alipayForm' })((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	/**
	 * 云帐单保存目录Handle
	 */
	const selectSaveHandle = debounce(
		(event: MouseEvent<HTMLInputElement>) => {
			const { setFieldsValue } = props.form;
			remote.dialog
				.showOpenDialog({
					properties: ['openDirectory']
				})
				.then((val: OpenDialogReturnValue) => {
					if (val.filePaths && val.filePaths.length > 0) {
						setFieldsValue({ savePath: val.filePaths[0] });
					}
				});
		},
		500,
		{ leading: true, trailing: false }
	);

	const formSubmit = (event: MouseEvent<HTMLButtonElement>) => {
		validateFields((err: any, values: { savePath: string }) => {
			if (!err) {
				props.okHandle(values.savePath);
			}
		});
	};

	return (
		<Modal
			footer={[
				<Button onClick={() => props.cancelHandle()} type="default" icon="close-circle">
					取消
				</Button>,
				<Button onClick={formSubmit} type="primary" icon="cloud-download">
					获取
				</Button>
			]}
			onCancel={() => props.cancelHandle()}
			visible={props.visibie}
			width={580}
			title="支付宝帐单云取"
			className="alipay-order-save-modal-root"
			destroyOnClose={true}
			maskClosable={false}>
			<div>
				<Form {...formItemLayout}>
					<Item label="保存目录">
						{getFieldDecorator('savePath', {
							rules: [
								{
									required: true,
									message: '请选择云帐单保存目录'
								}
							]
						})(
							<Input
								addonAfter={<Icon type="ellipsis" onClick={selectSaveHandle} />}
								readOnly={true}
								onClick={selectSaveHandle}
							/>
						)}
					</Item>
				</Form>
			</div>
		</Modal>
	);
});

AlipayOrderSaveModal.defaultProps = {
	visibie: false,
	okHandle: (arg: string) => {},
	cancelHandle: () => {}
};

export default AlipayOrderSaveModal;
