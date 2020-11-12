import path from 'path';
import React, { FC, useState } from 'react';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import classnames from 'classnames';
import Modal from 'antd/lib/Modal';
import message from 'antd/lib/message';
import ImportDataModal from './components/ImportDataModal/ImportDataModal';
import FtpUploadModal from './components/FtpUploadModal/FtpUploadModal';
import { useMount } from '@src/hooks';
import { helper } from '@utils/helper';
import logger from '@src/utils/log';
import { StoreComponent } from '@src/type/model';
import { MenuStoreState } from '@src/model/tools/Menu/Menu';
import bcpSvg from './images/bcp.svg';
import indataSvg from './images/indata.svg';
import simSvg from './images/sim.svg';
import uploadSvg from './images/upload.svg';
import './Menu.less';

const appRootPath = process.cwd();
const config = helper.readConf();

interface Prop extends StoreComponent {
	/**
	 * 仓库数据
	 */
	menu: MenuStoreState;
}

/**
 * 工具箱菜单
 * @param props 属性
 */
const Menu: FC<Prop> = (props) => {
	const [uploading, setUploading] = useState<boolean>(false);
	const [importDataModalVisible, setImportDataModalVisible] = useState<boolean>(false);
	const [ftpUploadModalVisible, setFtpUploadModalVisible] = useState<boolean>(false);

	useMount(() => {
		const { dispatch } = props;
		dispatch({ type: 'menu/queryFtpConfig' });
	});

	/**
	 * 关闭导入弹框
	 */
	const importDataModalCancelHandle = () => {
		setImportDataModalVisible(false);
	};

	/**
	 * 上传BCP文件回调
	 * @param fileList BCP文件列表
	 */
	const bcpUploadHandle = debounce(
		(fileList: string[]) => {
			const { ip, port, username, password, serverPath } = props.menu;
			setUploading(true);
			//note:格式：BcpFtp.exe 127.0.0.1 21 user pwd / file1 file2 file3
			helper
				.runExe(path.resolve(appRootPath, '../tools/BcpFtp/BcpFtp.exe'), [
					ip,
					port.toString(),
					username,
					password,
					serverPath,
					...fileList
				])
				.then((result: string) => {
					if (result === 'success') {
						message.success('上传成功');
					} else {
						message.success('上传失败');
					}
					setFtpUploadModalVisible(false);
				})
				.catch((err) => {
					message.success('上传出错');
					logger.error(`FTP上传出错 @view/tools/Menu/Menu.tsx: ${err.message}`);
				})
				.finally(() => setUploading(false));
		},
		600,
		{ leading: true, trailing: false }
	);

	return (
		<div className="tools-menu">
			<menu className={classnames({ pad: config.max <= 2 })}>
				<li>
					<a
						onClick={() =>
							Modal.info({
								title: 'BCP生成',
								content: '新功能，敬请期待',
								okText: '确定'
							})
						}>
						<i>
							<img src={bcpSvg} />
						</i>
						<div className="info">
							<span>BCP生成</span>
							<em>将报告文件生成BCP文件</em>
						</div>
					</a>
				</li>
				<li>
					<a
						onClick={() => {
							if (helper.isNullOrUndefinedOrEmptyString(props.menu.ip)) {
								message.info('未配置FTP，请在设置→FTP配置中进行设置');
							} else {
								setFtpUploadModalVisible(true);
							}
						}}>
						<i>
							<img src={uploadSvg} />
						</i>
						<div className="info">
							<span>BCP上传</span>
							<em>将案件上传到指定FTP服务器</em>
						</div>
					</a>
				</li>
				<li>
					<a onClick={() => setImportDataModalVisible(true)}>
						<i>
							<img src={indataSvg} />
						</i>
						<div className="info">
							<span>导入数据</span>
							<em>导入第三方数据进行解析</em>
						</div>
					</a>
				</li>
				<li>
					<a
						onClick={() =>
							Modal.info({
								title: 'SIM卡取证',
								content: '新功能，敬请期待',
								okText: '确定'
							})
						}>
						<i>
							<img src={simSvg} />
						</i>
						<div className="info">
							<span>SIM卡取证</span>
							<em></em>
						</div>
					</a>
				</li>
			</menu>
			<ImportDataModal
				isLoading={false}
				visible={importDataModalVisible}
				cancelHandle={importDataModalCancelHandle}
			/>
			<FtpUploadModal
				visible={ftpUploadModalVisible}
				loading={uploading}
				uploadHandle={bcpUploadHandle}
				cancelHandle={() => setFtpUploadModalVisible(false)}
			/>
		</div>
	);
};

export default connect((state: any) => ({ menu: state.menu }))(Menu);
