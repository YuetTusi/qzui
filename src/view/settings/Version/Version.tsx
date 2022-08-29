import fs from 'fs';
import path from 'path';
import ini from 'ini';
import React, { FC, useState, useRef } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import QuickCopy from '@src/components/QuickCopy';
import Manufaturer from '@src/schema/socket/Manufaturer';
import logo from './images/icon.png';
import { useAppSerial, useMount } from '@src/hooks';
import { helper } from '@utils/helper';
import LogList from './LogList';
import { LogItem } from './componentTypes';
import './Version.less';

const appRootPath = process.cwd();
const config = helper.readConf();
const jsonPath =
	process.env['NODE_ENV'] === 'development'
		? path.join(appRootPath, './data/manufaturer.json')
		: path.join(appRootPath, './resources/config/manufaturer.json');
const versionPath = path.join(appRootPath, './info.dat');

const filterString = (src: string) => src.replace(/-/g, '.');

/**
 * 版本信息
 */
const Version: FC<{}> = () => {
	let [publishModalVisible, setPublishModalVisible] = useState<boolean>(false);
	let [disabled, setDisabled] = useState<boolean>(false);
	let [manu, setManu] = useState<Manufaturer | null>(null);
	let serial = useAppSerial();
	let logs = useRef<any[]>([]);

	useMount(async () => {
		let exist = await helper.existFile(jsonPath);
		if (exist) {
			let next = await helper.readManufaturer();
			setManu(next);
		} else {
			setManu(null);
		}
	});

	useMount(async () => {
		let exist = await helper.existFile(versionPath);
		if (exist) {
			let logTxt = await readFile(versionPath);
			let logContent = ini.parse(logTxt);
			logContent = Object.entries(logContent);
			logs.current = logContent as Record<string, LogItem>[];
			setDisabled(false);
		} else {
			logs.current = [];
			setDisabled(true);
		}
	});

	/**
	 * Logo图路径
	 */
	const getLogo = () => {
		if (process.env.NODE_ENV === 'development') {
			return logo;
		} else {
			const logo = path.join(appRootPath, `./resources/config/${config.logo}`);
			return logo;
		}
	};

	/**
	 * 渲染版本信息
	 */
	const render = (data: Manufaturer | null) => {
		return (
			<div className="version-root">
				<div className="logo">
					<img
						src={getLogo()}
						alt="logo"
						width={300}
						height={300}
						onDoubleClick={() => {
							console.table(process.versions);
						}}
					/>
				</div>
				<div className="info">
					<div>
						<label>产品名称</label>
						<span>{data?.materials_name ?? ''}</span>
					</div>
					<div>
						<label>产品型号</label>
						<span>{data?.materials_model ?? ''}</span>
					</div>
					<div>
						<label>开发方</label>
						<span>{data?.manufacturer ?? ''}</span>
					</div>
					<div>
						<label>序列号</label>
						<QuickCopy desc="拷贝序列号">
							<span style={{ userSelect: 'text' }}>{serial}</span>
						</QuickCopy>
					</div>
					<div>
						<label>软件版本</label>
						<span>
							{helper.isNullOrUndefinedOrEmptyString(data?.materials_software_version)
								? 'v0.0.1'
								: filterString(data?.materials_software_version!)}
						</span>
					</div>
					<div style={{ padding: 0 }}>
						<label>发行日志</label>
						<span>
							<Button
								type="link"
								disabled={disabled}
								style={{ padding: 0 }}
								onClick={() => setPublishModalVisible(true)}>
								查看
							</Button>
						</span>
					</div>
				</div>
				<Modal
					visible={publishModalVisible}
					footer={[
						<Button
							type="primary"
							icon={'check-circle'}
							onClick={() => setPublishModalVisible(false)}>
							确定
						</Button>
					]}
					title="发行日志"
					centered={true}
					closable={false}
					width={1050}
					destroyOnClose={true}
					maskClosable={false}
					className="publish-modal-root">
					<LogList logs={logs.current} />
				</Modal>
			</div>
		);
	};

	return render(manu);
};

/**
 * 读取文件内容
 * @param path 文件路径
 * @return 文件内容的Promise
 */
function readFile(path: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(path, { encoding: 'utf8' }, (err, chunk) => {
			if (err) {
				reject(err.message);
			} else {
				resolve(chunk);
			}
		});
	});
}

export default Version;
