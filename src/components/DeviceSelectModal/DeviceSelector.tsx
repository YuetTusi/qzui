import React, { FC, useState, useEffect } from 'react';
import Empty from 'antd/lib/empty';
import Transfer, { TransferItem, RenderResult } from 'antd/lib/transfer';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';

const { fetchText } = helper.readConf();

interface Prop {
	/**
	 * 设备数据
	 */
	data: DeviceType[];
	/**
	 * 选择数据回调
	 */
	selectHandle: (arg0: string[]) => void;
}

/**
 * 设备选择组件
 * @param props
 */
const DeviceSelector: FC<Prop> = ({ data, selectHandle }) => {
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

	useEffect(() => {
		setSelectedKeys([]);
	}, [data]);

	const getData = () =>
		data.map(({ _id, mobileName, mobileHolder }) => {
			const title = `${mobileName!.split('_')[0]}
        （${mobileHolder}）`;
			return {
				key: _id!,
				title
			};
		});

	const renderItem = (item: TransferItem): RenderResult => {
		return {
			label: <span>{item.title}</span>,
			value: item.key
		};
	};

	const transferChange = (targetKeys: string[]) => {
		let pathList: string[] = [];
		setSelectedKeys(targetKeys);
		for (let i = 0, len = targetKeys.length; i < len; i++) {
			let temp = data.find((j) => j._id === targetKeys[i]);
			if (temp) {
				pathList.push(temp.phonePath!);
			}
		}
		selectHandle(pathList);
	};

	return (
		<div>
			<Transfer
				dataSource={getData()}
				targetKeys={selectedKeys}
				render={renderItem}
				onChange={transferChange}
				locale={{
					itemUnit: `条${fetchText ?? '取证'}数据`,
					itemsUnit: `条${fetchText ?? '取证'}数据`,
					notFoundContent: (
						<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)
				}}
				listStyle={{
					// width: 356,
					height: 400
				}}
				className="az-transfer"
			/>
		</div>
	);
};

export default DeviceSelector;
