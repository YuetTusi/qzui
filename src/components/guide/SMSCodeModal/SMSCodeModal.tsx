import React from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import withModeButton from '@src/components/enhance';
import { FormValue, Prop } from './SMSCodeModalTypes';
import './SMSCodeModal.less';

const ModeButton = withModeButton()(Button);
const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 18 }
};

/**
 * 短信验证码输入框
 * @param props
 */
const SMSCodeModal = Form.create<Prop>()((props: Prop) => {
	const { getFieldDecorator, validateFields } = props.form;

    /**
     * 表单提交
     */
	const formSubmit = () => {
		validateFields((err, values: FormValue) => {
			if (!err) {
				props.okHandle(values.smsCode ?? '', props.device);
			}
		});
	};

	return (
		<Modal
			footer={[
				<ModeButton onClick={props.cancelHandle} type="default" icon="close-circle">
					取消
				</ModeButton>,
				<ModeButton onClick={() => formSubmit()} type="primary" icon="check-circle">
					确定
				</ModeButton>
			]}
			visible={props.visible}
			onCancel={props.cancelHandle}
			title="验证码"
			destroyOnClose={true}
			maskClosable={false}
			className="sms-code-model-root">
			<Form {...formItemLayout}>
				<Item label="验证码">
					{getFieldDecorator('smsCode')(
						<Input maxLength={8} placeholder="请输入短信验证码" />
					)}
				</Item>
			</Form>
		</Modal>
	);
});

SMSCodeModal.defaultProps = {
	visible: false,
	okHandle: () => {},
	cancelHandle: () => {}
};

export default SMSCodeModal;
