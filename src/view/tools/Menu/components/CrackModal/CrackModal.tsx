import React, { useEffect } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { helper } from '@src/utils/helper';
import { Prop, UserAction, FormValue } from './componentType';
import './CrackModel.less';

const { Item } = Form;
const { Option } = Select;

/**
 * 设备破解弹框
 * @param props
 */
const CrackModal = Form.create<Prop>({ name: 'crackForm' })((props: Prop) => {
	const { dispatch } = props;
	const { getFieldDecorator } = props.form;
	const { dev } = props.crackModal;

	useEffect(() => {
		if (props.visible) {
			queryDev();
		}
	}, [props.visible]);

	const queryDev = () => {
		dispatch({ type: 'crackModal/queryDev' });
	};

	const renderOptions = () => {
		const { dev } = props.crackModal;
		return dev.map((item, index) => (
			<Option key={`Dev_${index}`} value={item.value}>
				{item.name}
			</Option>
		));
	};

	const renderMessage = () => {
		const { message } = props.crackModal;
		if (helper.isNullOrUndefined(message) || message.length === 0) {
			return <Empty description="暂无消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
		} else {
			return (
				<ul>
					{message.map((item, index) => (
						<li key={`M_${index}`}>{item}</li>
					))}
				</ul>
			);
		}
	};

	/**
	 * 表单Submit
	 */
	const formSubmit = (type: UserAction) => {
		const { validateFields } = props.form;
		validateFields((err, values: FormValue) => {
			if (!err) {
				switch (type) {
					case UserAction.Crack:
						dispatch({ type: 'crackModal/startCrack', payload: values.id });
						break;
					case UserAction.Recover:
						dispatch({ type: 'crackModal/startRecover', payload: values.id });
						break;
				}
			}
		});
	};

	/**
	 * 关闭弹框
	 */
	const closeHandle = () => {
		dispatch({ type: 'crackModal/setDev', payload: [] });
		dispatch({ type: 'crackModal/closeCrack' });
		dispatch({ type: 'crackModal/clearMessage' });
		props.cancelHandle();
	};

	return (
		<Modal
			footer={[
				<Button onClick={() => queryDev()} type="default" icon="sync">
					刷新设备
				</Button>,
				<Button onClick={() => formSubmit(UserAction.Crack)} type="primary" icon="key">
					开始破解
				</Button>,
				<Button
					onClick={() => formSubmit(UserAction.Recover)}
					type="primary"
					icon="interaction">
					开始恢复
				</Button>
			]}
			visible={props.visible}
			title="应用锁破解"
			destroyOnClose={true}
			maskClosable={false}
			onCancel={closeHandle}
			className="crack-modal-root">
			<Form>
				<Item label="设备">
					{getFieldDecorator('id', {
						initialValue:
							helper.isNullOrUndefined(dev) || dev.length === 0
								? undefined
								: dev[0].value,
						rules: [{ required: true, message: '请选择破解设备' }]
					})(
						<Select
							placeholder="请选择破解设备"
							notFoundContent={
								<Empty
									description="暂无设备"
									image={Empty.PRESENTED_IMAGE_SIMPLE}
								/>
							}>
							{renderOptions()}
						</Select>
					)}
				</Item>
			</Form>
			<div className="crack-msg">
				<div className="caption">消息</div>
				<div className="scroll-dev">{renderMessage()}</div>
			</div>
		</Modal>
	);
});

export default connect((state: any) => ({ crackModal: state.crackModal }))(CrackModal);
