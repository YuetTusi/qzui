import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { send } from '@src/service/tcpServer';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { calcRow, renderDevices } from './renderDevice';
import { StateTree } from '@src/type/model';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { TipType } from '@src/schema/socket/TipType';
import FetchData from '@src/schema/socket/FetchData';
import PhoneSystem from '@src/schema/socket/PhoneSystem';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { TableName } from '@src/schema/db/TableName';
import { DataMode } from '@src/schema/DataMode';
import { withModeButton } from '@src/components/enhance';
import HelpModal from '@src/components/guide/HelpModal/HelpModal';
import GuideModal from '@src/components/guide/GuideModal/GuideModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import CheckInputModal from './components/CheckInputModal/CheckInputModal';
import ServerCloudInputModal from './components/ServerCloudInputModal/ServerCloudInputModal';
import LiveModal from '@src/components/RecordModal/LiveModal';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import ApplePasswordModal from '@src/components/guide/ApplePasswordModal/ApplePasswordModal';
import CloudCodeModal from '@src/components/guide/CloudCodeModal/CloudCodeModal';
import CloudHistoryModal from '@src/components/RecordModal/CloudHistoryModal';
import { Prop, State } from './ComponentType';
import './Device.less';

const { max, useBcp } = helper.readConf();
const getDb = remote.getGlobal('getDb');
const { Group } = Button;
const ModeButton = withModeButton()(Button);

/**
 * 设备取证页
 */
class Device extends Component<Prop, State> {
	/**
	 * 当前采集的手机数据
	 */
	currentDevice: DeviceType;
	/**
	 * 当前正在查看记录的USB序号
	 */
	currentUsb?: number;
	/**
	 * 数据模式
	 */
	dataMode: DataMode;

	constructor(props: any) {
		super(props);
		this.state = {
			caseModalVisible: false,
			checkModalVisible: false,
			serverCloudModalVisible: false,
			fetchRecordModalVisible: false,
			usbDebugWithCloseModalVisible: false,
			appleModalVisible: false,
			helpModalVisible: false,
			guideModalVisible: false,
			applePasswordModalVisible: false,
			cloudHistoryModalVisible: false
		};
		this.currentDevice = {};
		this.dataMode = DataMode.Self;
		this.collectHandle = debounce(this.collectHandle, 400, { leading: true, trailing: false });
		this.startFetchHandle = debounce(this.startFetchHandle, 2000, {
			leading: true,
			trailing: false
		});
		this.stopHandle = debounce(this.stopHandle, 400, { leading: true, trailing: false });
		this.serverCloudHandle = debounce(this.serverCloudHandle, 400, {
			leading: true,
			trailing: false
		});
	}
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({ type: 'device/queryEmptyCase' });
		this.initDataMode();
	}
	/**
	 * 初始化数据模式
	 */
	initDataMode() {
		let mode = localStorage.getItem(LocalStoreKey.DataMode);
		if (mode === null) {
			this.dataMode = DataMode.Self;
		} else {
			this.dataMode = Number(mode);
		}
	}
	/**
	 * 采集前验证相关设置
	 */
	validateBeforeFetch = () => {
		const { isEmptyCase } = this.props.device;

		if (isEmptyCase) {
			message.info({
				content: '无案件数据，请在「案件管理」中创建案件'
			});
			return false;
		}
		if (helper.getUnit() === null) {
			message.info({
				content: useBcp
					? '未设置采集单位，请在「设置」→「采集单位」中配置'
					: '未设置单位，请在「设置」→「单位管理」中配置'
			});
			return false;
		}
		if (useBcp && helper.getDstUnit() === null) {
			//军队版本无需验证目的检验单位
			message.info({
				content: '未设置目的检验单位，请在「设置」→「目的检验单位」中配置'
			});
			return false;
		}
		return true;
	};
	/**
	 * 用户通过弹框手输数据
	 * @param {DeviceType} data 采集数据
	 */
	getCaseDataFromUser = async (data: DeviceType) => {
		if (!this.validateBeforeFetch()) {
			return;
		}
		switch (this.dataMode) {
			case DataMode.Self:
				//# 标准版本
				this.setState({ caseModalVisible: true });
				break;
			case DataMode.Check:
				//# 点验版本
				let fetchData: FetchData = await getDb(TableName.CheckData).findOne({
					serial: data.serial
				});

				if (fetchData === null) {
					this.setState({ checkModalVisible: true });
				} else {
					//note:如果数据库中存在此设备，直接走采集流程
					const [name] = fetchData.mobileName!.split('_');
					//*重新生成时间戳并加入偏移量，否则手速太快会造成时间一样覆盖目录
					fetchData.mobileName = `${name}_${helper.timestamp(data.usb)}`;
					this.startFetchHandle(fetchData);
				}
				break;
			default:
				//# 标准版本
				this.setState({ caseModalVisible: true });
				break;
		}
	};
	/**
	 * 通过警综平台获取数据
	 * @param data
	 */
	getCaseDataFromGuangZhouPlatform = (data: DeviceType) => {
		const { dispatch } = this.props;
		const { sendCase } = this.props.dashboard;
		if (helper.isNullOrUndefined(sendCase)) {
			message.destroy();
			message.info('未接收警综平台数据');
		} else {
			dispatch({
				type: 'device/saveCaseFromPlatform',
				payload: {
					device: data
				}
			});
		}
	};
	/**
	 * 取证按钮回调（采集一部手机）
	 * @param {DeviceType} data 设备数据
	 */
	collectHandle = (data: DeviceType) => {
		this.currentDevice = data; //寄存手机数据，采集时会使用
		if (this.dataMode === DataMode.GuangZhou) {
			//#广州警综平台
			this.getCaseDataFromGuangZhouPlatform(data);
		} else {
			//#标准或点验模式
			this.getCaseDataFromUser(data);
		}
	};
	/**
	 * 云取证回调
	 * @param {DeviceType} data 设备数据
	 */
	serverCloudHandle = (data: DeviceType) => {
		if (!this.validateBeforeFetch()) {
			return;
		}
		this.currentDevice = data; //寄存手机数据，采集时会使用
		this.setState({ serverCloudModalVisible: true });
	};
	/**
	 * 采集记录回调
	 * @param {DeviceType} data
	 */
	errorHandle = (data: DeviceType) => {
		this.currentUsb = data.usb;
		this.currentDevice = data;
		switch (data.mode) {
			case DataMode.ServerCloud:
				this.setState({ cloudHistoryModalVisible: true });
				break;
			default:
				this.setState({ fetchRecordModalVisible: true });
				break;
		}
	};
	/**
	 * 详情框取消
	 */
	cancelFetchRecordModalHandle = () => {
		this.currentUsb = undefined;
		this.currentDevice = {};
		this.setState({ fetchRecordModalVisible: false });
	};
	/**
	 * 停止按钮回调
	 * @param {DeviceType} data
	 */
	stopHandle = (data: DeviceType) => {
		const { dispatch } = this.props;
		ipcRenderer.send('time', data.usb! - 1, false);
		dispatch({
			type: 'device/updateProp',
			payload: {
				usb: data.usb,
				name: 'isStopping',
				value: true
			}
		});
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.StopFetch,
			msg: {
				usb: data.usb
			}
		});
	};
	/**
	 * 指引用户连接帮助
	 * @param {PhoneSystem} os 系统类型
	 */
	userHelpHandle = (os: PhoneSystem) => {
		switch (os) {
			case PhoneSystem.Android:
				this.setState({ usbDebugWithCloseModalVisible: true });
				break;
			default:
				this.setState({ appleModalVisible: true });
				break;
		}
	};
	/**
	 * 开始采集（3种取证入口共用此回调）
	 * @param {FetchData} fetchData 采集数据
	 */
	startFetchHandle = (fetchData: FetchData) => {
		const { dispatch } = this.props;
		this.setState({
			caseModalVisible: false,
			checkModalVisible: false,
			serverCloudModalVisible: false
		});
		if (fetchData.mode === DataMode.ServerCloud) {
			//#云取证把应用数据赋值给cloudCodeModal模型，以接收验证码详情
			const { usb } = this.currentDevice;
			dispatch({
				type: 'cloudCodeModal/setApps',
				payload: {
					usb,
					mobileHolder: fetchData.mobileHolder,
					mobileNumber: fetchData.mobileNumber,
					apps: fetchData.cloudAppList
				}
			});
		}

		dispatch({
			type: 'device/startFetch',
			payload: {
				deviceData: this.currentDevice,
				fetchData
			}
		});
	};
	/**
	 * 消息链接Click
	 * @param {DeviceType} data 当前device数据
	 */
	msgLinkHandle = (data: DeviceType) => {
		this.currentDevice = data;
		switch (this.currentDevice.tipType) {
			case TipType.Normal:
			case TipType.Flash:
				//后台定制弹框
				this.setState({ guideModalVisible: true });
				break;
			case TipType.ApplePassword:
				//iTunes备份密码确认弹框
				this.setState({ applePasswordModalVisible: true });
				break;
			case TipType.CloudCode:
				//云取证验证码弹框
				this.showCloudCodeModal(data);
				break;
		}
	};
	/**
	 * 消息框用户反馈
	 */
	guideHandle = (value: any, { usb }: DeviceType) => {
		console.log(`#${usb}终端反馈:${JSON.stringify(value)}`);
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.TipReply,
			msg: {
				usb,
				reply: value,
				password: '',
				type: -1
			}
		});
		this.setState({ guideModalVisible: false });
	};
	/**
	 * 采集输入框取消Click
	 */
	cancelCaseInputHandle = () => {
		this.setState({ caseModalVisible: false });
		this.currentDevice = {};
	};
	/**
	 * 点验输入框取消Click
	 */
	cancelCheckInputHandle = () => {
		this.setState({ checkModalVisible: false });
		this.currentDevice = {};
	};
	/**
	 * 云取证输入框取消Click
	 */
	cancelServerCloudModalHandle = () => {
		this.setState({ serverCloudModalVisible: false });
		this.currentDevice = {};
	};
	/**
	 * 用户未知密码放弃（type=2）
	 * @param {number} usb USB序号
	 */
	applePasswordCancelHandle = (usb?: number) => {
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.TipReply,
			msg: {
				usb,
				password: '',
				type: 2,
				reply: ''
			}
		});
		this.setState({ applePasswordModalVisible: false });
	};
	/**
	 * 用户输入密码确认(type=1)
	 * @param {string} password 密码
	 * @param {number} usb USB序号
	 */
	applePasswordConfirmHandle = (password: string, usb?: number) => {
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.TipReply,
			msg: {
				usb,
				password,
				type: 1,
				reply: ''
			}
		});
		this.setState({ applePasswordModalVisible: false });
	};
	/**
	 * 用户未知密码继续(type=3)
	 * @param {number} usb USB序号
	 */
	applePasswordWithoutPasswordHandle = (usb?: number) => {
		send(SocketType.Fetch, {
			type: SocketType.Fetch,
			cmd: CommandType.TipReply,
			msg: {
				usb,
				password: '',
				type: 3,
				reply: ''
			}
		});
		this.setState({ applePasswordModalVisible: false });
	};
	/**
	 * 显示云取证验证码详情框
	 * @param data 当前设备数据
	 */
	showCloudCodeModal = (data: DeviceType) => {
		const { dispatch } = this.props;
		//note: Code for test
		// dispatch({
		// 	type: 'cloudCodeModal/setApps',
		// 	payload: {
		// 		usb: data.usb,
		// 		mobileHolder: data.mobileHolder,
		// 		mobileNumber: data.mobileNumber,
		// 		apps: data.cloudAppList
		// 	}
		// });
		dispatch({
			type: 'cloudCodeModal/setVisible',
			payload: { usb: data.usb, visible: true }
		});
	};
	/**
	 * 关闭短信验证码弹框
	 */
	cloudCodeModalCancelHandle = () => {
		const { dispatch } = this.props;
		dispatch({
			type: 'cloudCodeModal/setVisible',
			payload: {
				visible: false
			}
		});
	};
	render(): JSX.Element {
		const { deviceList } = this.props.device;
		const cols = renderDevices(deviceList, this);
		const [, roleName] = this.props.location.search.split('=');

		return (
			<div className="device-root">
				<div className={classnames({ 'button-bar': true, pad: max <= 2 })}>
					<Group>
						<ModeButton
							icon="android"
							onClick={() => this.setState({ usbDebugWithCloseModalVisible: true })}>
							开启USB调试
						</ModeButton>
						<ModeButton
							icon="apple"
							onClick={() => this.setState({ appleModalVisible: true })}>
							Apple授权
						</ModeButton>
						<ModeButton
							icon="question-circle"
							onClick={() => this.setState({ helpModalVisible: true })}>
							操作帮助
						</ModeButton>
					</Group>
					<Button
						onClick={() => {
							let fetchData = {
								appList: [],
								caseId: 'adImR8fgAmI6Fo6a',
								caseName: '云取测试_20210415151142',
								casePath: 'D:\\',
								cloudAppList: [
									{
										m_strID: '1030063',
										name: 'Telegram',
										key: 'telegram',
										message: [],
										disabled: true,
										humanVerifyData: null
									}
								],
								cloudTimeout: 3600,
								cloudTimespan: 6,
								credential: '',
								hasReport: true,
								isAuto: true,
								mobileHolder: '测试员',
								mobileName: `BLA-AL00_${helper.timestamp()}`,
								mobileNo: '',
								mobileNumber: '18668137090',
								mode: 3,
								note: '',
								sdCard: true,
								serial: '6HJ4C19918006158',
								unitName: '公大鉴定中心'
							};
							let deviceData = {
								fetchState: 'Connected',
								isStopping: false,
								manufacturer: 'HUAWEI',
								model: 'BLA-AL00',
								parseState: 'NotParse',
								serial: '6HJ4C19918006158',
								system: 'android',
								tipType: 'nothing',
								usb: 1
							};

							this.props.dispatch({
								type: 'device/startFetch',
								payload: {
									deviceData,
									fetchData
								}
							});
						}}
						style={{ display: roleName === 'admin' ? 'inline-block' : 'none' }}
						type="danger">
						云取测试
					</Button>
					{/* <Button
						onClick={() => {
							let mock: DeviceType = {
								manufacturer: 'OnePlus',
								model: 'OnePlus',
								system: PhoneSystem.Android,
								usb: 2,
								tipType: TipType.Nothing,
								fetchType: [],
								serial: 'DX8L1PNXDP0N',
								phoneInfo: [
									{ name: '厂商', value: 'OnePlus' },
									{ name: '型号', value: '7T' },
									{ name: '系统版本', value: '11' },
									{ name: '序列号', value: 'DX8L1PNXDP0N' }
								],
								// mobileHolder: '老王',
								// mobileNumber: '13301234567',
								mode: DataMode.ServerCloud,
								cloudAppList: [
									new CloudApp({
										m_strID: '1030063',
										key: 'telegram'
									}),
									new CloudApp({
										m_strID: 'no_68a9a29e',
										key: 'crait'
									}),
									new CloudApp({
										m_strID: 'no_b92dd0ca',
										key: 'onedrive'
									})
								],
								fetchState: FetchState.Finished
							};
							this.props.dispatch({ type: 'device/setDeviceToList', payload: mock });
						}}>
						2-采集完成
					</Button>
					<Button
						onClick={() => {
							this.props.dispatch({
								type: 'cloudCodeModal/setState',
								payload: {
									usb: 2,
									apps: [{ m_strID: '1030063', state: CloudAppState.Success }]
								}
							});
							this.props.dispatch({
								type: 'cloudCodeModal/saveCloudLog',
								payload: { usb: 2 }
							});
						}}>
						2-取证完成写日志
					</Button>
					<Button
						onClick={() => {
							this.props.dispatch({
								type: 'device/setTip',
								payload: {
									usb: 2,
									tipType: TipType.CloudCode
								}
							});
						}}>
						2-短信验证码
					</Button>
					<Button
						onClick={() => {
							this.props.dispatch({
								type: 'cloudCodeModal/clearApps',
								payload: 2
							});
						}}>
						2-清理
					</Button> */}
				</div>
				<div className={max <= 2 ? 'panel only2' : 'panel'}>{calcRow(cols)}</div>
				<HelpModal
					visible={this.state.helpModalVisible}
					okHandle={() => this.setState({ helpModalVisible: false })}
					cancelHandle={() => this.setState({ helpModalVisible: false })}
				/>
				<GuideModal
					visible={this.state.guideModalVisible}
					device={this.currentDevice}
					yesHandle={this.guideHandle}
					noHandle={this.guideHandle}
					cancelHandle={() => this.setState({ guideModalVisible: false })}
				/>
				<CaseInputModal
					visible={this.state.caseModalVisible}
					device={this.currentDevice}
					saveHandle={this.startFetchHandle}
					cancelHandle={() => this.cancelCaseInputHandle()}
				/>
				<CheckInputModal
					visible={this.state.checkModalVisible}
					device={this.currentDevice}
					saveHandle={this.startFetchHandle}
					cancelHandle={() => this.cancelCheckInputHandle()}
				/>
				<ServerCloudInputModal
					visible={this.state.serverCloudModalVisible}
					device={this.currentDevice}
					saveHandle={this.startFetchHandle}
					cancelHandle={() => this.cancelServerCloudModalHandle()}
				/>
				<LiveModal
					usb={this.currentUsb!}
					visible={this.state.fetchRecordModalVisible}
					cancelHandle={this.cancelFetchRecordModalHandle}
				/>
				<UsbDebugWithCloseModal
					visible={this.state.usbDebugWithCloseModalVisible}
					okHandle={() => this.setState({ usbDebugWithCloseModalVisible: false })}
				/>
				<AppleModal
					visible={this.state.appleModalVisible}
					okHandle={() => this.setState({ appleModalVisible: false })}
				/>
				<ApplePasswordModal
					visible={this.state.applePasswordModalVisible}
					usb={this.currentDevice.usb}
					cancelHandle={this.applePasswordCancelHandle}
					confirmHandle={this.applePasswordConfirmHandle}
					withoutPasswordHandle={this.applePasswordWithoutPasswordHandle}
					closeHandle={() => this.setState({ applePasswordModalVisible: false })}
				/>
				<CloudCodeModal
					device={this.currentDevice}
					cancelHandle={this.cloudCodeModalCancelHandle}
				/>
				<CloudHistoryModal
					device={this.currentDevice}
					visible={this.state.cloudHistoryModalVisible}
					cancelHandle={() => this.setState({ cloudHistoryModalVisible: false })}
				/>
			</div>
		);
	}
}
export default connect((state: StateTree) => ({
	device: state.device,
	dashboard: state.dashboard
}))(Device);
