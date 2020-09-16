import React, { FC, memo, useRef } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { DeviceType } from '@src/schema/socket/DeviceType';
import EditForm from './EditForm';
import { helper } from '@src/utils/helper';

interface Prop {
	/**
	 * 隐藏/显示
	 */
	visible: boolean;
	/**
	 * 设备数据
	 */
	data: DeviceType;
	/**
	 * 关闭handle
	 */
	cancelHandle: () => void;
	/**
	 * 保存handle
	 */
	saveHandle: (data: DeviceType) => void;
}

/**
 * 编辑设备信息弹框
 */
const EditDeviceModal: FC<Prop> = (props) => {
	console.log('render...');

	const { data, visible } = props;

	const formRef = useRef<any>(null); //表单引用

	const formSubmit = () => {
		const { validateFields } = formRef.current;
		validateFields((err: Error | null, values: DeviceType) => {
			if (!err) {
				props.saveHandle({ ...data, ...values });
			}
		});
	};

	return (
		<Modal
			footer={[
				<Button onClick={props.cancelHandle} type="default" icon="close-circle" key="B_0">
					取消
				</Button>,
				<Button onClick={() => formSubmit()} type="primary" icon="save" key="B_1">
					保存
				</Button>
			]}
			visible={visible}
			maskClosable={false}
			destroyOnClose={true}
			onCancel={props.cancelHandle}
			title={`编辑-${
				helper.isNullOrUndefined(data.mobileName) ? '' : data.mobileName?.split('_')[0]
			}`}
			width={600}>
			<EditForm data={data} ref={formRef} />
		</Modal>
	);
};

export default memo(EditDeviceModal);
