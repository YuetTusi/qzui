import path from 'path';
import React, { FC, useState, useRef, MouseEvent } from 'react';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import Table from 'antd/lib/table';
import message from 'antd/lib/message';
import SortModal from '../SortModal/SortModal';
import KeyWordModal from '../KeyWordModal/KeyWordModal';
import InnerTable from './InnerTable';
import { useMount } from '@src/hooks';
import { helper } from '@src/utils/helper';
import { getColumns } from './columns';
import { Prop, ChatData } from './componentTypes';

import './Chat.less';

let jsonPath = './';
if (process.env['NODE_ENV'] === 'development') {
	jsonPath = path.join(process.cwd(), 'data/words.json');
} else {
	jsonPath = path.join(process.cwd(), 'resources/data/words.json');
}
/**
 * 聊天关键词配置
 * @param props
 */
const Chat: FC<Prop> = (props) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
	const [keywordModalVisible, setKeywordModalVisible] = useState<boolean>(false);
	const [data, setData] = useState<ChatData[]>([]);
	const currentSort = useRef<ChatData>();
	const currentSortId = useRef<string>();

	/**
	 * 读取JSON文件
	 */
	const loadFile = async () => {
		setLoading(true);
		try {
			let next: ChatData[] = await helper.readJSONFile(jsonPath);
			setData(next);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useMount(loadFile);

	const addSortClick = (e: MouseEvent<HTMLButtonElement>) => {
		currentSort.current = undefined;
		setSortModalVisible(true);
	};

	/**
	 * 添加/编辑保存handle
	 */
	const saveSortHandle = async (newData: ChatData) => {
		if (helper.isNullOrUndefined(newData?.id)) {
			//添加
			const next: ChatData = { ...newData };
			next.id = uuid();
			data.push(next);
			try {
				await helper.writeJSONfile(jsonPath, data);
				await loadFile();
				message.success('保存成功');
				setSortModalVisible(false);
			} catch (error) {
				message.error('保存失败');
			}
		} else {
			//编辑
			const next: ChatData = { ...newData };
			const updated = data.map((item) => {
				if (item.id === next.id) {
					return next;
				} else {
					return item;
				}
			});
			try {
				await helper.writeJSONfile(jsonPath, updated);
				await loadFile();
				message.success('保存成功');
				setSortModalVisible(false);
			} catch (error) {
				message.error('保存失败');
			}
		}
	};

	const editHandle = (editData: ChatData) => {
		currentSort.current = editData;
		setSortModalVisible(true);
	};

	const delHandle = async (id: string) => {
		const next = data.filter((item) => item.id !== id);
		try {
			await helper.writeJSONfile(jsonPath, next);
			await loadFile();
			message.success('保存成功');
			setSortModalVisible(false);
		} catch (error) {
			message.error('保存失败');
		}
	};

	/**
	 * 添加分下关键词handle
	 * @param data 分类数据
	 */
	const addKeyWordHandle = (data: ChatData) => {
		currentSortId.current = data.id;
		setKeywordModalVisible(true);
	};

	/**
	 * 保存分类下的关键词
	 * @param sortId 分类id
	 * @param word 关键词
	 */
	const saveKeyWordHandle = async (sortId: string, word: string) => {
		const next = data.map((sort) => {
			if (sort.id === sortId) {
				sort.children = [word, ...sort.children];
			}
			return sort;
		});
		try {
			await helper.writeJSONfile(jsonPath, next);
			await loadFile();
			message.success('保存成功');
			setKeywordModalVisible(false);
		} catch (error) {
			message.error('保存失败');
		}
	};

	return (
		<div className="chat-root">
			<div className="btn-bar">
				<Button type="primary" icon="plus-circle" onClick={addSortClick}>
					添加分类
				</Button>
			</div>
			<div className="table-panel">
				<Table<ChatData>
					dataSource={data}
					loading={loading}
					bordered={true}
					expandRowByClick={true}
					columns={getColumns(editHandle, delHandle, addKeyWordHandle)}
					expandedRowRender={(record) => {
						return <InnerTable data={record.children} />;
					}}
					size="small"
					rowKey="id"
					childrenColumnName="keywords"
				/>
			</div>
			<SortModal
				visible={sortModalVisible}
				saveHandle={saveSortHandle}
				data={currentSort.current!}
				closeHandle={() => setSortModalVisible(false)}
			/>
			<KeyWordModal
				sortId={currentSortId.current!}
				visible={keywordModalVisible}
				saveHandle={saveKeyWordHandle}
				closeHandle={() => {
					currentSortId.current = undefined;
					setKeywordModalVisible(false);
				}}
			/>
		</div>
	);
};

export default Chat;
