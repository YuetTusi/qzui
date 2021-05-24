import { OpenDialogReturnValue, remote } from 'electron';
import React, { MouseEvent } from 'react';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';

interface Prop extends FormComponentProps {
	visibie: boolean;
	okHandle: () => void;
	cancelHandle: () => void;
}

const formItemLayout = {
	labelCol: { span: 5 },
	wrapperCol: { span: 10 }
};
const { Item } = Form;

/**
 * AI相似图像分析弹框（Fake功能）
 * @param props
 * @returns
 */
const AIPhotoSimilarModal = Form.create<Prop>()((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	/**
	 * 云帐单保存目录Handle
	 */
	const selectDirHandle = debounce(
		(field: string) => {
			const { setFieldsValue } = props.form;
			remote.dialog
				.showOpenDialog({
					properties: ['openDirectory']
				})
				.then((val: OpenDialogReturnValue) => {
					if (val.filePaths && val.filePaths.length > 0) {
						setFieldsValue({ [field]: val.filePaths[0] });
					}
				});
		},
		500,
		{ leading: true, trailing: false }
	);

	const formSubmit = (event: MouseEvent<HTMLButtonElement>) => {
		validateFields((err: any, values: { savePath: string }) => {
			if (!err) {
				message.info('正在对照片进行AI分析...');
				props.okHandle();
			}
		});
	};

	return (
		<Modal
			footer={[
				<Button onClick={() => props.cancelHandle()} type="default" icon="close-circle">
					取消
				</Button>,
				<Button onClick={formSubmit} type="primary" icon="check-circle">
					确定
				</Button>
			]}
			onCancel={() => props.cancelHandle()}
			visible={props.visibie}
			width={580}
			title="AI相似人像查看"
			className="alipay-order-save-modal-root"
			centered={true}
			destroyOnClose={true}
			maskClosable={false}>
			<div>
				<Form {...formItemLayout}>
					<Item label="人像图片" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
						{getFieldDecorator('avatar', {
							rules: [
								{
									required: true,
									message: '请选择人像图片'
								}
							]
						})(
							<Input
								placeholder="请选择人像图片"
								addonAfter={
									<Icon
										type="ellipsis"
										onClick={() => selectDirHandle('avatar')}
									/>
								}
								readOnly={true}
								onClick={() => selectDirHandle('avatar')}
							/>
						)}
					</Item>
					<Item label="检材数据" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
						{getFieldDecorator('phoneData', {
							rules: [
								{
									required: true,
									message: '请选择检材数据'
								}
							]
						})(
							<Input
								placeholder="请选择检材数据"
								addonAfter={
									<Icon
										type="ellipsis"
										onClick={() => selectDirHandle('phoneData')}
									/>
								}
								readOnly={true}
								onClick={() => selectDirHandle('phoneData')}
							/>
						)}
					</Item>
				</Form>
			</div>
		</Modal>
	);
});

export default AIPhotoSimilarModal;
