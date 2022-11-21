import path from 'path';
import React, { FC, useRef, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPortrait, faUnlockAlt, faPhoneVolume, faCamera } from '@fortawesome/free-solid-svg-icons';
import { faApple, faAlipay, faAndroid } from '@fortawesome/free-brands-svg-icons';
import { StateTree, StoreComponent } from '@src/type/model';
import { MenuStoreState } from '@src/model/tools/Menu/Menu';
import { ImportTypes } from '@src/schema/ImportType';
import { CrackTypes } from '@src/schema/CrackTypes';
import { helper } from '@utils/helper';
import CrackModal from './components/CrackModal';
import ImportDataModal from './components/ImportDataModal';
import AlipayOrderSelectModal from './components/AlipayOrderSaveModal';
import AIPhotoSimilarModal from './components/AIPhotoSimilarModal';
import MiChangeModal from './components/MiChangeModal';
import SnapshotModal from './components/SnapshotModal';
import huaweiSvg from './images/huawei.svg';
import hwcopyPng from './images/hwcopy.png';
import oppoSvg from './images/oppo.svg';
import vivoSvg from './images/vivo.svg';
import miSvg from './images/mi.svg';
import miChangePng from './images/michange.png';
import honorSvg from './images/honor.svg';
import umagicSvg from './images/umagic.svg';
import blackberrySvg from './images/blackberry.svg';
import badaSvg from './images/bada.svg';
import featurephoneSvg from './images/featurephone.svg';
import meegoSvg from './images/meego.svg';
import symbianSvg from './images/symbian.svg';
import windowsmobileSvg from './images/windowsmobile.svg';
import windowsphoneSvg from './images/windowsphone.svg';
import chat from './images/chat.svg';
import './Menu.less';

const appPath = process.cwd();
const config = helper.readConf();

interface Prop extends StoreComponent {
	/**
	 * 仓库数据
	 */
	menu: MenuStoreState;
}

/**
 * 工具箱菜单
 */
const Menu: FC<Prop> = (props) => {
	const [importDataModalVisible, setImportDataModalVisible] = useState<boolean>(false);
	const [crackModalVisible, setCrackModalVisible] = useState<boolean>(false);
	const [alipayOrderSaveModalVisible, setAlipayOrderSaveModalVisible] = useState<boolean>(false);
	const [aiPhotoSimilarModalVisible, setAiPhotoSimilarModalVisible] = useState<boolean>(false);
	const [miChangeModalVisible, setMiChangeModalVisible] = useState<boolean>(false);
	const [snapshotModalVisible, setSnapshotModalVisible] = useState<boolean>(false);
	const currentImportType = useRef(ImportTypes.IOS);
	const currentCrackType = useRef(CrackTypes.VivoAppLock);

	/**
	 * 造假
	 * @param brand 品牌
	 */
	const fakeModal = (brand: string) => {
		const handle = Modal.info({
			title: '正在检测',
			content: `正在检测连接${config.devText ?? '设备'}，请稍等...`,
			okText: '确定',
			centered: true,
			okButtonProps: { disabled: true, icon: 'loading' }
		});
		setTimeout(() => {
			handle.update({
				title: `未检测到${config.devText ?? '设备'}`,
				content: `未检测到${brand}${config.devText ?? '设备'}`,
				okText: '确定',
				centered: true,
				okButtonProps: { disabled: false, icon: 'check-circle' }
			});
		}, 1500);
	};

	/**
	 * 关闭导入弹框
	 */
	const importDataModalCancelHandle = () => setImportDataModalVisible(false);

	/**
	 * 导入第三方数据按钮Click
	 * @param event 事件对象
	 * @param type 导入类型
	 */
	const importDataLiClick = (event: MouseEvent<HTMLLIElement>, type: ImportTypes) => {
		currentImportType.current = type;
		setImportDataModalVisible(true);
	};

	/**
	 * 应用锁破解按钮Click
	 * @param event 事件对象
	 * @param type 破解类型
	 */
	const crackLiClick = (event: MouseEvent<HTMLLIElement>, type: CrackTypes) => {
		currentCrackType.current = type;
		setCrackModalVisible(true);
	};

	/**
	 * 调起开机密码破解工具
	 */
	const runPasswordToolHandle = () => {
		message.info('正在启动工具，请稍等...');
		helper
			.runExe(path.resolve(appPath, '../tools/Defender/defender.exe'))
			.catch((errMsg: string) => {
				console.log(errMsg);
				message.destroy();
				Modal.error({
					title: '启动失败',
					content: '启动失败，请联系技术支持',
					okText: '确定'
				});
			});
	};

	/**
	 * 启动聊天记录下载工具handle
	 */
	const runChatDownloaderHandle = () => {
		message.info('正在启动工具，请稍等...');
		const cwd = path.resolve(appPath, '../tools/export_chat');
		helper.runExe(path.join(cwd, 'export_chat.exe'), [], cwd).catch((errMsg: string) => {
			console.log(errMsg);
			message.destroy();
			Modal.error({
				title: '启动失败',
				content: '启动失败，请联系技术支持',
				okText: '确定'
			});
		});
	};

	/**
	 * 启动通话记录下载工具handle
	 */
	const runPhoneRecDownloaderHandle = () => {
		message.info('正在启动工具，请稍等...');
		const cwd = path.resolve(appPath, '../tools/ExportTool');
		helper.runExe(path.join(cwd, 'ExportTool.exe'), [], cwd).catch((errMsg: string) => {
			console.log(errMsg);
			message.destroy();
			Modal.error({
				title: '启动失败',
				content: '启动失败，请联系技术支持',
				okText: '确定'
			});
		});
	};

	/**
	 * 小米换机导入handle
	 */
	const miChangeHandle = () => setMiChangeModalVisible(true);

	/**
	 * 苹果手机截屏handle
	 */
	const snapshotHandle = (saveTo: string) => setSnapshotModalVisible(false);


	return (
		<div className="tools-menu">
			<div className="sort-root">
				<div className="sort">
					<div className="caption">导入第三方数据</div>
					<hr />
					<ul>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.IOS)
							}>
							<div className="fn-box">
								<i>
									<FontAwesomeIcon icon={faApple} color="#222" />
								</i>
								<span>苹果iTunes备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.IOSMirror)
							}>
							<div className="fn-box">
								<i>
									<FontAwesomeIcon icon={faApple} color="#222" />
								</i>
								<span>苹果镜像导入</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.Hisuite)
							}>
							<div className="fn-box">
								<i>
									<img src={huaweiSvg} />
								</i>
								<span>华为备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.HuaweiOTG)
							}>
							<div className="fn-box">
								<i>
									<img src={huaweiSvg} />
								</i>
								<span>华为OTG备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.HuaweiClone)
							}>
							<div className="fn-box">
								<i>
									<img src={hwcopyPng} />
								</i>
								<span>华为手机克隆备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.Hisuite)
							}>
							<div className="fn-box">
								<i>
									<img src={honorSvg} />
								</i>
								<span>荣耀备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.Hisuite)
							}>
							<div className="fn-box">
								<i>
									<img src={umagicSvg} />
								</i>
								<span>联通备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.VivoPcBackup)
							}>
							<div className="fn-box">
								<i>
									<img src={vivoSvg} />
								</i>
								<span>VIVO PC备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.OppoBackup)
							}>
							<div className="fn-box">
								<i>
									<img src={oppoSvg} />
								</i>
								<span>OPPO自备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.XiaomiBackup)
							}>
							<div className="fn-box">
								<i>
									<img src={miSvg} />
								</i>
								<span>小米自备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.XiaomiChange)
							}>
							<div className="fn-box">
								<i>
									<img src={miChangePng} />
								</i>
								<span>小米换机备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.AndroidData)
							}>
							<div className="fn-box">
								<i>
									<FontAwesomeIcon icon={faAndroid} color="#97c023" />
								</i>
								<span>安卓数据</span>
							</div>
						</li>
					</ul>
				</div>
				<div className="sort">
					<div className="caption">应用锁破解</div>
					<hr />
					<ul>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								crackLiClick(e, CrackTypes.VivoAppLock)
							}>
							<div className="fn-box">
								<i>
									<img src={vivoSvg} />
								</i>
								<span>VIVO应用锁</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								crackLiClick(e, CrackTypes.OppoAppLock)
							}>
							<div className="fn-box">
								<i>
									<img src={oppoSvg} />
								</i>
								<span>OPPO应用锁</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								crackLiClick(e, CrackTypes.OppoMoveLock)
							}>
							<div className="fn-box">
								<i>
									<img src={oppoSvg} />
								</i>
								<span>OPPO隐私锁</span>
							</div>
						</li>
					</ul>
				</div>
				{config.useFakeButton ? (
					<div className="sort">
						<div className="caption">其他品牌{config.devText ?? '设备'}取证</div>
						<hr />
						<ul>
							<li onClick={() => fakeModal('黑莓')}>
								<div className="fn-box">
									<i>
										<img src={blackberrySvg} />
									</i>
									<span>黑莓</span>
								</div>
							</li>
							<li onClick={() => fakeModal('塞班')}>
								<div className="fn-box">
									<i>
										<img src={symbianSvg} />
									</i>
									<span>塞班</span>
								</div>
							</li>
							<li onClick={() => fakeModal('WindowsMobile')}>
								<div className="fn-box">
									<i>
										<img src={windowsmobileSvg} />
									</i>
									<span>WindowsMobile</span>
								</div>
							</li>
							<li onClick={() => fakeModal('WindowsPhone')}>
								<div className="fn-box">
									<i>
										<img src={windowsphoneSvg} />
									</i>
									<span>WindowsPhone</span>
								</div>
							</li>
							<li onClick={() => fakeModal('BadaOS')}>
								<div className="fn-box">
									<i>
										<img src={badaSvg} />
									</i>
									<span>BadaOS</span>
								</div>
							</li>
							<li onClick={() => fakeModal('MeegoOS')}>
								<div className="fn-box">
									<i>
										<img src={meegoSvg} />
									</i>
									<span>MeegoOS</span>
								</div>
							</li>
							<li onClick={() => fakeModal('功能机/山寨机')}>
								<div className="fn-box">
									<i>
										<img src={featurephoneSvg} />
									</i>
									<span>功能机/山寨机</span>
								</div>
							</li>
						</ul>
					</div>
				) : null}
				<div className="sort">
					<div className="caption">其他功能</div>
					<hr />
					<ul>
						<li onClick={() => setAlipayOrderSaveModalVisible(true)}>
							<div className="fn-box">
								<i>
									<FontAwesomeIcon icon={faAlipay} color="#1477fe" />
								</i>
								<span>支付宝账单云取</span>
							</div>
						</li>
						<li onClick={() => runChatDownloaderHandle()}>
							<div className="fn-box">
								<i>
									<img src={chat} alt="数据导出工具" />
								</i>
								<span>数据导出工具</span>
							</div>
						</li>
						<li onClick={() => runPhoneRecDownloaderHandle()}>
							<div className="fn-box">
								<i>
									<FontAwesomeIcon icon={faPhoneVolume} color="#00c9c0" />
								</i>
								<span>通话记录导出工具</span>
							</div>
						</li>
						<li onClick={() => miChangeHandle()}>
							<div className="fn-box">
								<i>
									<img src={miChangePng} />
								</i>
								<span>小米换机采集</span>
							</div>
						</li>
						{config.useFakeButton ? (
							<>
								<li
									onClick={(e: MouseEvent<HTMLLIElement>) =>
										runPasswordToolHandle()
									}>
									<div className="fn-box">
										<i>
											<FontAwesomeIcon icon={faUnlockAlt} color="#00b7c3" />
										</i>
										<span>华为开机密码破解</span>
									</div>
								</li>
								<li
									onClick={(e: MouseEvent<HTMLLIElement>) =>
										setAiPhotoSimilarModalVisible(true)
									}>
									<div className="fn-box">
										<i>
											<FontAwesomeIcon icon={faPortrait} color="#808080" />
										</i>
										<span>AI相似人像查看</span>
									</div>
								</li>
							</>
						) : null}
						<li onClick={() => setSnapshotModalVisible(true)}>
							<div className="fn-box">
								<i>
									<FontAwesomeIcon icon={faCamera} color="#317ddb" />
								</i>
								<span>截屏获取</span>
							</div>
						</li>
					</ul>
				</div>
			</div>
			<ImportDataModal
				visible={importDataModalVisible}
				type={currentImportType.current}
				cancelHandle={importDataModalCancelHandle}
			/>
			<CrackModal
				visible={crackModalVisible}
				type={currentCrackType.current}
				cancelHandle={() => setCrackModalVisible(false)}
			/>
			<AlipayOrderSelectModal
				visibie={alipayOrderSaveModalVisible}
				okHandle={(savePath: string) => {
					message.info('正在启动云取程序...请稍后');
					helper
						.runExe(path.join(appPath, '../tools/yuntools/alipay_yun.exe'), [savePath])
						.then(() => message.destroy())
						.catch((err) => {
							message.destroy();
							message.error(`启动云取程序失败: ${err.message}`);
						});
					setAlipayOrderSaveModalVisible(false);
				}}
				cancelHandle={() => setAlipayOrderSaveModalVisible(false)}
			/>
			<AIPhotoSimilarModal
				visibie={aiPhotoSimilarModalVisible}
				okHandle={() => setAiPhotoSimilarModalVisible(false)}
				cancelHandle={() => setAiPhotoSimilarModalVisible(false)}
			/>
			<MiChangeModal
				visible={miChangeModalVisible}
				onOk={(targetPath) => {
					message.info('正在启动工具，请稍等...');
					const cwd = path.resolve(appPath, '../tools/mhj');
					helper.runExe(path.join(cwd, 'mhj.exe'), [targetPath], cwd).catch((errMsg: string) => {
						console.log(errMsg);
						message.destroy();
						Modal.error({
							title: '启动失败',
							content: '启动失败，请联系技术支持',
							okText: '确定'
						});
					});
					setMiChangeModalVisible(false);
				}}
				onCancel={() => setMiChangeModalVisible(false)}
			/>
			<SnapshotModal
				visible={snapshotModalVisible}
				cancelHandle={() => setSnapshotModalVisible(false)} />
		</div>
	);
};

export default connect((state: StateTree) => ({ menu: state.menu }))(Menu);
