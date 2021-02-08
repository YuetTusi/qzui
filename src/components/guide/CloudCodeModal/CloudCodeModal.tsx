import React, { memo } from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import withModeButton from '@src/components/enhance';
import { FormValue, Prop, CloudModalPressAction } from './CloudCodeModalType';
import './CloudCodeModal.less';

const ModeButton = withModeButton()(Button);
const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 18 }
};

/**
 * 云取证验证证码/密码输入框
 * @param props
 */
const CloudCodeModal = Form.create<Prop>()((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

	/**
	 * 表单提交
	 * @param {UserAction} 点按分类
	 */
	const formSubmit = (action: CloudModalPressAction) => {
		switch (action) {
			case CloudModalPressAction.Send:
				validateFields((err, values: FormValue) => {
					if (!err) {
						props.okHandle(
							values.smsCode ?? '',
							CloudModalPressAction.Send,
							props.device
						);
					}
				});
				break;
			case CloudModalPressAction.Skip:
				props.okHandle('', CloudModalPressAction.Skip, props.device);
				break;
			case CloudModalPressAction.ResendCode:
				props.okHandle('', CloudModalPressAction.ResendCode, props.device);
				break;
		}
	};

	return (
		<Modal
			footer={[
				<ModeButton
					onClick={() => formSubmit(CloudModalPressAction.ResendCode)}
					type="default"
					icon="message">
					重新发送验证码
				</ModeButton>,
				<ModeButton
					onClick={() => formSubmit(CloudModalPressAction.Skip)}
					type="primary"
					icon="arrow-right">
					跳过该应用
				</ModeButton>,
				<ModeButton
					onClick={() => formSubmit(CloudModalPressAction.Send)}
					type="primary"
					icon="check-circle">
					确定
				</ModeButton>
			]}
			visible={props.visible}
			onCancel={props.cancelHandle}
			title="短信验证码"
			destroyOnClose={true}
			maskClosable={false}
			className="cloud-code-model-root">
			<Form {...formItemLayout}>
				<Item label="验证码">
					{getFieldDecorator('smsCode', {
						rules: [{ required: true, message: '请填写验证码' }]
					})(<Input maxLength={20} placeholder="请输入验证码" />)}
				</Item>
			</Form>
		</Modal>
	);
});

CloudCodeModal.defaultProps = {
	visible: false,
	okHandle: () => {},
	cancelHandle: () => {}
};

export default memo(CloudCodeModal);
