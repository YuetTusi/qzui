import path from 'path';
import { remote, OpenDialogReturnValue } from 'electron';
import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import Statistic from 'antd/lib/statistic';
import message from 'antd/lib/message';
import debounce from 'lodash/debounce';
import xls from 'node-xlsx';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { useMount } from '@src/hooks';
import Title from '@src/components/title/Title';
import { Prop, SaveType, Keywords } from './componentTypes';
import './Word.less';

const { dialog } = remote;
const { Group } = Button;
let saveTo = './';
if (process.env['NODE_ENV'] === 'development') {
	saveTo = path.join(process.cwd(), 'data');
} else {
	saveTo = path.join(process.cwd(), 'resources/data');
}

const readCount = async (type: SaveType): Promise<number> => {
	let target: string | null = null;
	switch (type) {
		case SaveType.Words:
			target = path.join(saveTo, 'words.json');
			break;
		case SaveType.Browser:
			target = path.join(saveTo, 'browser.json');
			break;
		case SaveType.Apps:
			target = path.join(saveTo, 'apps.json');
			break;
	}
	try {
		let data: Keywords[] = await helper.readJSONFile(target);
		return data.reduce((acc: number, cur: Keywords) => (acc += cur.children.length), 0);
	} catch (error) {
		return error;
	}
};

/**
 * 读取Excel文件返回JSON数据
 * @param excelPath Excel文件位置
 */
const getDataFromExcel = (excelPath: string): Keywords[] => {
	// const [sortName] = path.basename(excelPath).split('.');
	try {
		const origin = xls.parse(excelPath);

		return origin.map((sheet) => ({
			sort: sheet.name,
			level: 1,
			children: sheet.data.map((row: any[]) => row[0])
		}));
	} catch (error) {
		message.error(`读取Excel文档失败`);
		return [];
	}
};

/**
 * 涉案词设置
 * @param props
 */
const Word: FC<Prop> = (props) => {
	const [wordsCount, setWordsCount] = useState(0);
	const [browserCount, setBrowseCount] = useState(0);
	const [appsCount, setAppsCount] = useState(0);
	const [wordsExcel, setWordsExcel] = useState<string | null>(null); //聊天内容Excel路径
	const [browserExcel, setBrowserExcel] = useState<string | null>(null); //浏览器Excel路径
	const [appsExcel, setAppsExcel] = useState<string | null>(null); //敏感应用Excel路径
	const [loading, setLoading] = useState<boolean>(false);

	useMount(() => loadCount());

	useMount(() => {
		setWordsExcel(localStorage.getItem(LocalStoreKey.WordsExcel));
		setBrowserExcel(localStorage.getItem(LocalStoreKey.BrowserExcel));
		setAppsExcel(localStorage.getItem(LocalStoreKey.AppsExcel));
	});

	/**
	 * 重新加载关键词数量
	 */
	const loadCount = async () => {
		try {
			const [words, browser, apps] = await Promise.allSettled([
				readCount(SaveType.Words),
				readCount(SaveType.Browser),
				readCount(SaveType.Apps)
			]);
			if (words.status === 'fulfilled') {
				setWordsCount(words.value);
			}
			if (browser.status === 'fulfilled') {
				setBrowseCount(browser.value);
			}
			if (apps.status === 'fulfilled') {
				setAppsCount(apps.value);
			}
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * 保存JSON文件
	 */
	const saveJson = (type: SaveType, data: Keywords[]) => {
		let target: string | null = null;
		switch (type) {
			case SaveType.Words:
				target = path.join(saveTo, 'words.json');
				setWordsExcel(target);
				break;
			case SaveType.Browser:
				target = path.join(saveTo, 'browser.json');
				setBrowserExcel(target);
				break;
			case SaveType.Apps:
				target = path.join(saveTo, 'apps.json');
				setAppsExcel(target);
				break;
		}
		if (target !== null) {
			return helper.writeJSONfile(target, data);
		} else {
			return Promise.resolve(false);
		}
	};

	/**
	 * 选择Excel文件
	 * @param type 类型
	 */
	const selectExcel = debounce(
		(type: SaveType) => {
			dialog
				.showOpenDialog({
					title: '请选择Excel文件',
					properties: ['openFile'],
					filters: [{ name: 'Office Excel文档', extensions: ['xls', 'xlsx'] }]
				})
				.then((val: OpenDialogReturnValue) => {
					setLoading(true);
					if (val && val.filePaths.length > 0) {
						const excelPath = val.filePaths[0];
						const data = getDataFromExcel(excelPath);
						switch (type) {
							case SaveType.Words:
								localStorage.setItem(LocalStoreKey.WordsExcel, excelPath);
								break;
							case SaveType.Browser:
								localStorage.setItem(LocalStoreKey.BrowserExcel, excelPath);
								break;
							case SaveType.Apps:
								localStorage.setItem(LocalStoreKey.AppsExcel, excelPath);
								break;
						}
						return saveJson(type, data);
					} else {
						return Promise.resolve(false);
					}
				})
				.then((success: boolean) => {
					if (success) {
						message.success('导入成功');
						return readCount(type);
					} else {
						return Promise.resolve(-1);
					}
				})
				.then((count) => {
					if (count !== -1) {
						switch (type) {
							case SaveType.Words:
								setWordsCount(count);
								break;
							case SaveType.Browser:
								setBrowseCount(count);
								break;
							case SaveType.Apps:
								setAppsCount(count);
								break;
						}
					}
				})
				.catch((err) => {
					message.error('保存失败');
				})
				.finally(() => setLoading(false));
		},
		500,
		{ leading: true, trailing: false }
	);

	/**
	 * 更新Excel文件
	 * @param type 类型
	 */
	const updateExcel = async (type: SaveType) => {
		let excelPath: string | null = null;
		switch (type) {
			case SaveType.Words:
				excelPath = localStorage.getItem(LocalStoreKey.WordsExcel);
				break;
			case SaveType.Browser:
				excelPath = localStorage.getItem(LocalStoreKey.BrowserExcel);
				break;
			case SaveType.Apps:
				excelPath = localStorage.getItem(LocalStoreKey.AppsExcel);
				break;
		}
		if (excelPath === null) {
			return;
		}
		try {
			setLoading(true);
			let exist = await helper.existFile(excelPath);
			if (exist) {
				let data: Keywords[] = getDataFromExcel(excelPath);
				let success = await saveJson(type, data);
				if (success) {
					await loadCount();
					message.destroy();
					message.success('更新成功');
				} else {
					message.destroy();
					message.error('更新失败');
				}
			} else {
				message.destroy();
				message.info('Excel文件不存在，请重新导入数据');
			}
		} catch (error) {
			message.destroy();
			message.info('更新数据失败，请重新导入数据');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="word-root">
			<Title>关键词配置</Title>
			<div className="word-panel">
				<div className="word-card">
					<div className="caption">聊天内容</div>
					<div className="ct">
						<div>
							<Statistic
								title="关键词："
								value={wordsCount}
								groupSeparator={''}
								suffix="条"
							/>
						</div>
						<div className="btn-bar">
							<Group>
								<Button
									onClick={() => selectExcel(SaveType.Words)}
									loading={loading}
									type="primary"
									icon="select">
									导入
								</Button>
								<Button
									onClick={() => updateExcel(SaveType.Words)}
									disabled={wordsExcel === null}
									loading={loading}
									type="primary"
									icon="file-sync">
									更新
								</Button>
							</Group>
						</div>
					</div>
				</div>
				<div className="word-card">
					<div className="caption">浏览器</div>
					<div className="ct">
						<div>
							<Statistic
								title="关键词:"
								value={browserCount}
								groupSeparator={''}
								suffix="条"
							/>
						</div>
						<div className="btn-bar">
							<Group>
								<Button
									onClick={() => selectExcel(SaveType.Browser)}
									loading={loading}
									type="primary"
									icon="select">
									导入
								</Button>
								<Button
									onClick={() => updateExcel(SaveType.Browser)}
									loading={loading}
									disabled={browserExcel === null}
									type="primary"
									icon="file-sync">
									更新
								</Button>
							</Group>
						</div>
					</div>
				</div>
				<div className="word-card">
					<div className="caption">敏感App</div>
					<div className="ct">
						<div>
							<Statistic
								title="关键词:"
								value={appsCount}
								groupSeparator={''}
								suffix="条"
							/>
						</div>
						<div className="btn-bar">
							<Group>
								<Button
									onClick={() => selectExcel(SaveType.Apps)}
									loading={loading}
									type="primary"
									icon="select">
									导入
								</Button>
								<Button
									onClick={() => updateExcel(SaveType.Apps)}
									loading={loading}
									disabled={appsExcel === null}
									type="primary"
									icon="file-sync">
									更新
								</Button>
							</Group>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Word;
