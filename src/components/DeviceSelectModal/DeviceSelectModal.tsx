import { ipcRenderer } from 'electron';
import React, { FC, useRef, useState } from 'react';
import moment from 'moment';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { useMount } from '@src/hooks';
import CCaseInfo from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';
import DeviceType from '@src/schema/socket/DeviceType';
import DeviceSelector from './DeviceSelector';
import './DeviceSelectModal.less';
import { helper } from '@src/utils/helper';

const { caseText } = helper.readConf()!;

interface Prop {
	/**
	 * 是否显示
	 */
	visible: boolean;
	/**
	 * 确定handle
	 */
	okHandle: (pathList: string[]) => void;
	/**
	 * 取消handle
	 */
	cancelHandle: () => void;
}

const { Option } = Select;

/**
 * 设备选择框
 * @param props
 */
const DeviceSelectModal: FC<Prop> = ({ visible, okHandle, cancelHandle }) => {
	const [caseData, setCaseData] = useState<CCaseInfo[]>([]);
	const [deviceData, setDeviceData] = useState<DeviceType[]>([]);
	const selectedPath = useRef<string[]>([]);

	useMount(async () => {
		try {
			let data: CCaseInfo[] = await ipcRenderer.invoke('db-find', TableName.Case, null);
			setCaseData(data);
		} catch (error) {
			message.error(`${caseText ?? '案件'}数据查询失败`);
		}
	});

	/**
	 * 渲染Options
	 */
	const renderOptions = (caseData: CCaseInfo[]) =>
		caseData.map(({ _id, createdAt, m_strCaseName }) => {
			const [caseName] = m_strCaseName.split('_');
			return (
				<Option value={_id} key={_id}>
					{`${caseName}（${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}）`}
				</Option>
			);
		});

	/**
	 * 案件SelectChange事件
	 */
	const caseChange = async (id: string) => {
		selectedPath.current = [];
		try {
			let data: DeviceType[] = await ipcRenderer.invoke('db-find', TableName.Device, {
				caseId: id
			});
			setDeviceData(data);
		} catch (error) {
			message.error('查询设备数据失败');
		}
	};

	return (
		<Modal
			visible={visible}
			closable={false}
			width={800}
			onOk={() => okHandle(selectedPath.current)}
			onCancel={() => {
				selectedPath.current = [];
				setDeviceData([]);
				cancelHandle();
			}}
			destroyOnClose={true}
			okText="确定"
			cancelText="取消"
			className="device-select-modal-root">
			<div>
				<div>
					<Select
						onChange={caseChange}
						style={{ width: '100%' }}
						placeholder={`请选择${caseText ?? '案件'}`}>
						{renderOptions(caseData)}
					</Select>
				</div>
				<hr />
				<div>
					<DeviceSelector
						data={deviceData}
						selectHandle={(pathList: string[]) => {
							selectedPath.current = pathList;
						}}
					/>
				</div>
			</div>
		</Modal>
	);
};

DeviceSelectModal.defaultProps = {
	visible: false
};

export default DeviceSelectModal;
