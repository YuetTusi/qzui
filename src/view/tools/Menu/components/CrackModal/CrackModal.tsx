import React, { useEffect } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { StateTree } from '@src/type/model';
import { withModeButton } from '@src/components/enhance/modeButton';
import { helper } from '@src/utils/helper';
import { Prop, UserAction, FormValue } from './componentType';
import './CrackModel.less';

const { Item } = Form;
const { Option } = Select;
const ModeButton = withModeButton()(Button);

/**
 * 设备破解弹框
 * @param props
 */
const CrackModal = Form.create<Prop>({ name: 'crackForm' })((props: Prop) => {
	const { dispatch,type } = props;
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
		let { dev } = props.crackModal;
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
	const formSubmit = (action: UserAction) => {
		const { validateFields } = props.form;
		validateFields((err, values: FormValue) => {
			if (!err) {
				switch (action) {
					case UserAction.Crack:
						dispatch({
							type: 'crackModal/startCrack',
							payload: { id: values.id, type }
						});
						break;
					case UserAction.Recover:
						dispatch({
							type: 'crackModal/startRecover',
							payload: { id: values.id, type }
						});
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
				<ModeButton onClick={() => queryDev()} type="default" icon="sync">
					刷新设备
				</ModeButton>,
				<ModeButton onClick={() => formSubmit(UserAction.Crack)} type="primary" icon="key">
					开始破解
				</ModeButton>,
				<ModeButton
					onClick={() => formSubmit(UserAction.Recover)}
					type="primary"
					icon="interaction">
					开始恢复
				</ModeButton>
			]}
			visible={props.visible}
			title="应用锁破解"
			centered={true}
			destroyOnClose={true}
			maskClosable={false}
			onCancel={closeHandle}
			className="crack-modal-root">
			<fieldset className="tip-msg">
				<legend>应用锁破解提示</legend>
				<ul>
					<li>该功能只支持部分VIVO和OPPO手机</li>
					<li>OPPO手机应用锁破解后无法恢复，部分手机可能导致系统设置无法打开</li>
					<li>
						VIVO手机破解后可恢复，手机接入后，必须勾选一律允许使用这台计算机进行调试，
						取证后接入手机进行恢复，否则系统设置无法打开
					</li>
				</ul>
			</fieldset>
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

export default connect((state: StateTree) => ({ crackModal: state.crackModal }))(CrackModal);
