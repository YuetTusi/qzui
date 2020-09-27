import path from 'path';
import { remote, ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { send } from '@src/service/tcpServer';
import Db from '@src/utils/db';
import { helper } from '@src/utils/helper';
import { calcRow, renderDevices } from './renderDevice';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { TipType } from '@src/schema/socket/TipType';
import FetchData from '@src/schema/socket/FetchData';
import PhoneSystem from '@src/schema/socket/PhoneSystem';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { TableName } from '@src/schema/db/TableName';
import { withModeButton } from '@src/components/enhance';
import HelpModal from '@src/components/guide/HelpModal/HelpModal';
import GuideModal from '@src/components/guide/GuideModal/GuideModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import CheckInputModal from './components/CheckInputModal/CheckInputModal';
import LiveModal from '@src/components/RecordModal/LiveModal';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import ApplePasswordModal from '@src/components/guide/ApplePasswordModal/ApplePasswordModal';
// import OppoDevModal from '@src/components/TipsModal/OppoDevModal/OppoDevModal';
import { Prop, State } from './ComponentType';
import './Device.less';

const deviceCount: number = helper.readConf().max;
let checkJsonPath = ''; //点验JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	checkJsonPath = path.join(remote.app.getAppPath(), './data/check.json');
} else {
	checkJsonPath = path.join(remote.app.getAppPath(), '../data/check.json');
}
const { Group } = Button;
const ModeButton = withModeButton()(Button);

class Device extends Component<Prop, State> {
	/**
	 * 当前采集的手机数据
	 */
	currentDevice: DeviceType;
	/**
	 * 当前正在查看记录的USB序号
	 */
	currentUsb?: number;

	constructor(props: any) {
		super(props);
		this.state = {
			caseModalVisible: false,
			checkModalVisible: false,
			fetchRecordModalVisible: false,
			usbDebugWithCloseModalVisible: false,
			appleModalVisible: false,
			helpModalVisible: false,
			guideModalVisible: false,
			applePasswordModalVisible: false
		};
		this.currentDevice = {};
	}
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({ type: 'device/queryEmptyCase' });
	}
	/**
	 * 用户通过弹框手输数据
	 * @param {DeviceType} data 采集数据
	 */
	getCaseDataFromUser = async (data: DeviceType) => {
		const { isEmptyCase } = this.props.device;
		let isCheckMode = false; //是否是点验模式
		let exist = await helper.existFile(checkJsonPath);
		if (exist) {
			isCheckMode = (await helper.readJSONFile(checkJsonPath)).isCheck;
		}

		if (isEmptyCase) {
			message.info({
				content: '无案件数据，请在「案件管理」中创建案件'
			});
		} else if (isCheckMode) {
			//# 点验版本
			let fetchData: FetchData = await new Db<FetchData>(TableName.CheckData).findOne({
				serial: data.serial
			});
			if (fetchData === null) {
				this.setState({ checkModalVisible: true });
			} else {
				//note:如果数据库中存在此设备，直接走采集流程
				const [name] = fetchData.mobileName!.split('_');
				//*重新生成时间戳并加入偏移量，否则手速太快会造成时间一样覆盖目录
				fetchData.mobileName = `${name}_${helper.timestamp(data.usb)}`;
				this.fetchInputHandle(fetchData);
			}
		} else {
			//# 标准版本
			this.setState({ caseModalVisible: true });
		}
	};
	/**
	 * 开始取证按钮回调（采集一部手机）
	 * @param {DeviceType} data
	 */
	collectHandle = (data: DeviceType) => {
		this.currentDevice = data; //寄存手机数据，采集时会使用
		this.getCaseDataFromUser(data);
	};
	/**
	 * 异常记录回调
	 * @param {DeviceType} data
	 */
	errorHandle = (data: DeviceType) => {
		this.currentUsb = data.usb;
		this.setState({ fetchRecordModalVisible: true });
	};
	/**
	 * 详情框取消
	 */
	cancelFetchRecordModalHandle = () => {
		this.currentUsb = undefined;
		this.setState({ fetchRecordModalVisible: false });
	};
	/**
	 * 停止按钮回调
	 * @param {DeviceType} data
	 */
	stopHandle = (data: DeviceType) => {
		const { dispatch } = this.props;
		console.log('停止取证', {
			type: SocketType.Fetch,
			cmd: CommandType.StopFetch,
			msg: {
				usb: data.usb
			}
		});
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
	 * @param {PhoneSystem} system 系统类型
	 */
	userHelpHandle = (system: PhoneSystem) => {
		if (system === PhoneSystem.Android) {
			this.setState({ usbDebugWithCloseModalVisible: true });
		} else {
			this.setState({ appleModalVisible: true });
		}
	};
	/**
	 * 采集前保存案件数据（标准案件录入和点验录入共用此回调）
	 * @param {FetchData} fetchData 采集数据
	 */
	fetchInputHandle = (fetchData: FetchData) => {
		const { dispatch } = this.props;
		this.setState({
			caseModalVisible: false,
			checkModalVisible: false
		});
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
			case TipType.ApplePassword:
				//iTunes备份密码确认弹框
				this.setState({ applePasswordModalVisible: true });
				break;
			case TipType.Flash:
			case TipType.Normal:
				//后台定制弹框
				this.setState({ guideModalVisible: true });
				break;
		}
	};
	/**
	 * 消息框用户点`是`
	 */
	guideYesHandle = (value: any, { usb }: DeviceType) => {
		console.log(`${usb}终端反馈:${JSON.stringify(value)}`);
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
	 * 消息框用户点`否`
	 */
	guideNoHandle = (value: any, { usb }: DeviceType) => {
		console.log(`${usb}终端反馈:${JSON.stringify(value)}`);
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
	render(): JSX.Element {
		const { deviceList } = this.props.device;
		const cols = renderDevices(deviceList, this);

		return (
			<div className="device-root">
				<div className="button-bar">
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
					{/* <Button
                        onClick={() => {
                            let mock: DeviceType = {
                                manufacturer: 'apple',
                                model: 'iPhone8',
                                system: 'ios',
                                usb: 2,
                                tipType: TipType.Nothing,
                                fetchType: [],
                                serial: '1006',
                                phoneInfo: [
                                    { name: '厂商', value: 'OPPO' },
                                    { name: '型号', value: 'A30' }
                                ],
                                fetchState: FetchState.Connected
                            };
                            this.props.dispatch({ type: 'device/setDeviceToList', payload: mock });
                        }}
                    >
                        2
                    </Button>
                    <Button
                        onClick={() => {
                            this.props.dispatch({
                                type: 'device/setTip',
                                payload: {
                                    usb: 2,
                                    tipType: TipType.ApplePassword
                                }
                            });
                        }}
                    >
                        iTunesPassword
                    </Button> */}
				</div>
				<div className={deviceCount <= 2 ? 'panel only2' : 'panel'}>{calcRow(cols)}</div>
				<HelpModal
					visible={this.state.helpModalVisible}
					okHandle={() => this.setState({ helpModalVisible: false })}
					cancelHandle={() => this.setState({ helpModalVisible: false })}
				/>
				<GuideModal
					{...this.currentDevice}
					visible={this.state.guideModalVisible}
					yesHandle={this.guideYesHandle}
					noHandle={this.guideNoHandle}
					cancelHandle={() => this.setState({ guideModalVisible: false })}
				/>
				<CaseInputModal
					visible={this.state.caseModalVisible}
					device={this.currentDevice}
					saveHandle={this.fetchInputHandle}
					cancelHandle={() => this.cancelCaseInputHandle()}
				/>
				<CheckInputModal
					visible={this.state.checkModalVisible}
					device={this.currentDevice}
					saveHandle={this.fetchInputHandle}
					cancelHandle={() => this.cancelCheckInputHandle()}
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
			</div>
		);
	}
}
export default connect((state: any) => ({ device: state.device }))(Device);
