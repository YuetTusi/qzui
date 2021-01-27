import React, { FC, useState } from 'react';
import List from 'antd/lib/list';
import Title from '@src/components/title/Title';
import { useMount } from '@src/hooks';
import UserHistory, { HistoryKeys } from '@src/utils/userHistory';
import ListHeader from './ListHeader';
import './InputHistory.less';

interface Prop {}

const { Item } = List;

/**
 * 输入项历史记录管理（不开放给用户）
 * @param props
 */
const InputHistory: FC<Prop> = (props) => {
	const [deviceHolder, setDeviceHolder] = useState<string[]>([]);
	const [deviceName, setDeviceName] = useState<string[]>([]);
	const [deviceNo, setDeviceNo] = useState<string[]>([]);
	const [unitName, setUnitName] = useState<string[]>([]);
	const [mobileNumber, setMobileNumber] = useState<string[]>([]);

	useMount(() => {
		let deviceHolder = UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER);
		let deviceName = UserHistory.get(HistoryKeys.HISTORY_DEVICENAME);
		let deviceNo = UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER);
		let unitName = UserHistory.get(HistoryKeys.HISTORY_UNITNAME);
		let mobileNumber = UserHistory.get(HistoryKeys.HISTORY_MOBILENUMBER);

		setDeviceHolder(deviceHolder);
		setDeviceName(deviceName);
		setDeviceNo(deviceNo);
		setUnitName(unitName);
		setMobileNumber(mobileNumber);
	});

	const renderItem = (item: string) => {
		return <Item>{item}</Item>;
	};

	/**
	 * 清除Handle
	 * @param key 键
	 */
	const delHandle = (key: HistoryKeys) => {
		UserHistory.clear(key);
		switch (key) {
			case HistoryKeys.HISTORY_DEVICEHOLDER:
				setDeviceHolder([]);
				break;
			case HistoryKeys.HISTORY_DEVICENAME:
				setDeviceName([]);
				break;
			case HistoryKeys.HISTORY_DEVICENUMBER:
				setDeviceNo([]);
				break;
			case HistoryKeys.HISTORY_UNITNAME:
				setUnitName([]);
				break;
			case HistoryKeys.HISTORY_MOBILENUMBER:
				setMobileNumber([]);
				break;
		}
	};

	return (
		<div className="input-history-root">
			<Title>历史记录清除</Title>
			<div className="all-list">
				<div className="each-list">
					<ListHeader delHandle={() => delHandle(HistoryKeys.HISTORY_DEVICEHOLDER)}>
						持有人
					</ListHeader>
					<div className="scroll">
						<List
							dataSource={deviceHolder}
							renderItem={renderItem}
							bordered={true}
							size="small"
							locale={{ emptyText: '无数据' }}></List>
					</div>
				</div>
				<div className="each-list">
					<ListHeader delHandle={() => delHandle(HistoryKeys.HISTORY_DEVICENAME)}>
						手机名称
					</ListHeader>
					<div className="scroll">
						<List
							dataSource={deviceName}
							renderItem={renderItem}
							bordered={true}
							size="small"
							locale={{ emptyText: '无数据' }}></List>
					</div>
				</div>
				<div className="each-list">
					<ListHeader delHandle={() => delHandle(HistoryKeys.HISTORY_DEVICENUMBER)}>
						手机编号
					</ListHeader>
					<div className="scroll">
						<List
							dataSource={deviceNo}
							renderItem={renderItem}
							bordered={true}
							size="small"
							locale={{ emptyText: '无数据' }}></List>
					</div>
				</div>
				<div className="each-list">
					<ListHeader delHandle={() => delHandle(HistoryKeys.HISTORY_MOBILENUMBER)}>
						手机号
					</ListHeader>
					<div className="scroll">
						<List
							dataSource={mobileNumber}
							renderItem={renderItem}
							bordered={true}
							size="small"
							locale={{ emptyText: '无数据' }}></List>
					</div>
				</div>
				<div className="each-list">
					<ListHeader delHandle={() => delHandle(HistoryKeys.HISTORY_UNITNAME)}>
						检验单位
					</ListHeader>
					<div className="scroll">
						<List
							dataSource={unitName}
							renderItem={renderItem}
							bordered={true}
							size="small"
							locale={{ emptyText: '无数据' }}></List>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InputHistory;
