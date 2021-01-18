import fs from 'fs';
import path from 'path';
import ini from 'ini';
import nunjucks from 'nunjucks';
import React, { FC, useState } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import logo from './images/icon.png';
import { useMount } from '@src/hooks';
import { helper } from '@utils/helper';
import { template } from './template';
import Manufaturer from '@src/schema/socket/Manufaturer';
import './Version.less';

const appRootPath = process.cwd();
const config = helper.readConf();
const jsonPath =
	process.env['NODE_ENV'] === 'development'
		? path.join(appRootPath, './data/manufaturer.json')
		: path.join(appRootPath, './resources/config/manufaturer.json');
const versionPath = path.join(appRootPath, './info.dat');

interface Prop {}

/**
 * 版本信息
 * @param props
 */
const Version: FC<Prop> = (props) => {
	let [publishModalVisible, setPublishModalVisible] = useState<boolean>(false);
	let [disabled, setDisabled] = useState<boolean>(false);
	let [manu, setManu] = useState<Manufaturer | null>(null);
	let [logHtml, setLogHtml] = useState('');

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
		console.log(versionPath);
		let exist = await helper.existFile(versionPath);
		console.log(exist);
		if (exist) {
			let logTxt = await readFile(versionPath);
			let logContent = ini.parse(logTxt);
			logContent = Object.entries(logContent);
			let publishHtml = nunjucks.renderString(template, { logs: logContent });
			setLogHtml(publishHtml);
			setDisabled(false);
		} else {
			setLogHtml('');
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
						onDoubleClick={() => {}}
					/>
				</div>
				<div className="info">
					<div>
						<label>产品描述</label>
						<span>{data?.materials_name ?? ''}</span>
					</div>
					<div>
						<label>开发者</label>
						<span>{data?.manufacturer ?? ''}</span>
					</div>
					<div>
						<label>版本号</label>
						<span>{data?.materials_software_version ?? 'v0.0.1'}</span>
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
					<div dangerouslySetInnerHTML={{ __html: logHtml }}></div>
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
