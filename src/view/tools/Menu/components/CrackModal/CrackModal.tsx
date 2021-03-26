import React, { useEffect } from 'react';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { StateTree } from '@src/type/model';
import { withModeButton } from '@src/components/enhance/modeButton';
import { helper } from '@src/utils/helper';
import { CrackTypes } from '@src/schema/CrackTypes';
import CrackTip from './CrackTip';
import { Prop, UserAction, FormValue } from './componentType';
import crackImg from './images/crack_1.png';
import './CrackModel.less';

const { Item } = Form;
const { Option } = Select;
const ModeButton = withModeButton()(Button);
let modalTitle = '应用锁破解';

/**
 * 设备破解弹框
 * @param props
 */
const CrackModal = Form.create<Prop>({ name: 'crackForm' })((props: Prop) => {
	const { dispatch, type } = props;
	const { getFieldDecorator } = props.form;
	const { dev } = props.crackModal;

	useEffect(() => {
		if (props.visible) {
			queryDev();
		}
	}, [props.visible]);
	useEffect(() => {
		switch (type) {
			case CrackTypes.VivoAppLock:
				modalTitle = 'VIVO应用锁破解';
				break;
			case CrackTypes.OppoAppLock:
				modalTitle = 'OPPO应用锁破解';
				break;
			case CrackTypes.OppoMoveLock:
				modalTitle = 'OPPO隐私锁破解';
				break;
		}
	}, [props.visible]);

	const queryDev = debounce(
		() => {
			dispatch({ type: 'crackModal/queryDev' });
		},
		500,
		{ leading: true, trailing: false }
	);

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
				<ModeButton
					onClick={() => {
						dispatch({ type: 'crackModal/clearMessage' });
						queryDev();
					}}
					type="default"
					icon="sync">
					刷新设备
				</ModeButton>,
				<ModeButton
					onClick={() => {
						dispatch({ type: 'crackModal/clearMessage' });
						formSubmit(UserAction.Crack);
					}}
					type="primary"
					icon="key">
					开始破解
				</ModeButton>,
				<ModeButton
					onClick={() => {
						dispatch({ type: 'crackModal/clearMessage' });
						formSubmit(UserAction.Recover);
					}}
					type="primary"
					icon="interaction">
					开始恢复
				</ModeButton>
			]}
			visible={props.visible}
			width={850}
			centered={true}
			title={modalTitle}
			destroyOnClose={true}
			maskClosable={false}
			onCancel={closeHandle}
			className="crack-modal-root">
			<div className="crack-cbox">
				<div className="left">
					<CrackTip type={type} />
				</div>
				<div className="right">
					<fieldset className="tip-msg full">
						<legend>
							请勾选“<strong>一律允许</strong>”使用这台计算机进行调试
						</legend>
						<div>
							<img src={crackImg} alt="破解提示" width="320" />
						</div>
					</fieldset>
				</div>
			</div>
			<Form layout="horizontal" style={{ marginTop: '10px' }}>
				<Item label="设备" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
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
