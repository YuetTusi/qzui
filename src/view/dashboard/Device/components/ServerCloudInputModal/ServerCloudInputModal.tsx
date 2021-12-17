import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { FC, MouseEvent, useCallback, useEffect, useState, useRef, memo } from 'react';
import round from 'lodash/round';
import { connect } from 'dva';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Collapse from 'antd/lib/collapse';
import Button from 'antd/lib/button';
import AutoComplete from 'antd/lib/auto-complete';
import Checkbox from 'antd/lib/checkbox';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import { StateTree } from '@src/type/model';
import { ITreeNode } from '@src/type/ztree';
import { withModeButton } from '@src/components/enhance';
import { CloudAppSelectModal } from '@src/components/AppSelectModal';
import Instruction from '@src/components/Instruction';
import { useMount, useSubscribe } from '@src/hooks';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { Backslashe, UnderLine, MobileNumber } from '@utils/regex';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';
import { DataMode } from '@src/schema/DataMode';
import { CloudApp } from '@src/schema/CloudApp';
import PanelHeader from './PanelHeader';
import { Prop, FormValue } from './componentTypes';
import './ServerCloudInputModal.less';

const { Panel } = Collapse;
const ModeButton = withModeButton()(Button);
const config = helper.readConf();

/**
 * 过滤勾选的node，返回level==2的应用结点
 * @param treeNode 勾选的zTree结点
 */
function filterToParseApp(treeNodes: ITreeNode[]) {
	return treeNodes
		.filter((node) => node.level == 2)
		.map(
			(node) =>
				new CloudApp({
					m_strID: node.id,
					key: node.appKey,
					name: node.appDesc
				})
		);
}

/**
 * 保存云取相关时间数据到localStorage
 * @param cloudTimeout 云取超时时间
 * @param cloudTimespan 云取时间间隔
 * @param isAlive 是否保活
 */
function saveTimeToStorage(cloudTimeout: number, cloudTimespan: number, isAlive: boolean = false) {
	if (cloudTimeout != helper.CLOUD_TIMEOUT) {
		localStorage.setItem(LocalStoreKey.CloudTimeout, cloudTimeout.toString());
	}
	if (cloudTimespan != helper.CLOUD_TIMESPAN) {
		localStorage.setItem(LocalStoreKey.CloudTimespan, cloudTimespan.toString());
	}
	localStorage.setItem(LocalStoreKey.IsAlive, isAlive ? '1' : '0');
}

/**
 * 从localStorage中取云取时间值
 * @param key 键
 */
function getTimeFromStorage(key: LocalStoreKey) {
	switch (key) {
		case LocalStoreKey.CloudTimeout:
			let timeout = localStorage.getItem(LocalStoreKey.CloudTimeout);
			return timeout === null ? helper.CLOUD_TIMEOUT : Number.parseInt(timeout);
		case LocalStoreKey.CloudTimespan:
			let timespan = localStorage.getItem(LocalStoreKey.CloudTimespan);
			return timespan === null ? helper.CLOUD_TIMESPAN : Number.parseInt(timespan);
		default:
			return 0;
	}
}

function getIsAliveFromStorage() {
	return localStorage.getItem(LocalStoreKey.IsAlive) === '1';
}

/**
 * 采集录入框（短信云取证）
 */
const ServerCloudInputModal: FC<Prop> = (props) => {
	const [appSelectModalVisible, setAppSelectModalVisible] = useState(false);
	const [selectedApps, setSelectedApps] = useState<CloudApp[]>([]);
	const [activePanelKey, setActivePanelKey] = useState('0'); //当前
	const caseId = useRef<string>(''); //案件id
	const spareName = useRef<string>(''); //案件备用名
	const casePath = useRef<string>(''); //案件存储路径
	const sdCard = useRef<boolean>(false); //是否拉取SD卡
	const hasReport = useRef<boolean>(false); //是否生成报告
	const isAuto = useRef<boolean>(false); //是否自动解析
	const unitName = useRef<string>(''); //检验单位
	const historyDeviceName = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENAME));
	const historyDeviceHolder = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER));
	const historyDeviceNumber = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER));
	const historyMobileNumber = useRef(UserHistory.get(HistoryKeys.HISTORY_MOBILENUMBER));

	useMount(() => {
		const { dispatch } = props;
		dispatch({ type: 'serverCloudInputModal/queryCaseList' });
	});

	useEffect(() => {
		historyDeviceName.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENAME);
		historyDeviceHolder.current = UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER);
		historyDeviceNumber.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER);
		historyMobileNumber.current = UserHistory.get(HistoryKeys.HISTORY_MOBILENUMBER);
	}, [props.visible]);

	useSubscribe(
		'protocol-read',
		(event: IpcRendererEvent, fetchData: FetchData, agree: boolean) => {
			const { cloudTimeout, cloudTimespan, isAlive } = fetchData;
			if (agree) {
				setSelectedApps([]);
				setActivePanelKey('0');
				saveTimeToStorage(cloudTimeout!, cloudTimespan!, isAlive);
				props.saveHandle!(fetchData);
			}
		}
	);

	/**
	 * 绑定案件下拉数据
	 */
	const bindCaseSelect = () => {
		const { caseList } = props.serverCloudInputModal!;
		const { Option } = Select;
		return caseList.map((opt: CCaseInfo) => {
			let pos = opt.m_strCaseName.lastIndexOf('\\');
			let [name, tick] = opt.m_strCaseName.substring(pos + 1).split('_');
			return (
				<Option
					value={opt.m_strCaseName.substring(pos + 1)}
					data-case-id={opt._id}
					data-spare-name={opt.spareName}
					data-case-path={opt.m_strCasePath}
					data-app-list={opt.m_Applist}
					data-sdcard={opt.sdCard}
					data-has-report={opt.hasReport}
					data-is-auto={opt.m_bIsAutoParse}
					data-unitname={opt.m_strCheckUnitName}
					key={opt._id}>
					{`${name}（${helper
						.parseDate(tick, 'YYYYMMDDHHmmss')
						.format('YYYY-M-D H:mm:ss')}）`}
				</Option>
			);
		});
	};

	/**
	 * 案件下拉Change
	 */
	const caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
		caseId.current = (option as JSX.Element).props['data-case-id'] as string;
		spareName.current = (option as JSX.Element).props['data-spare-name'] as string;
		casePath.current = (option as JSX.Element).props['data-case-path'] as string;
		isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
		sdCard.current = (option as JSX.Element).props['data-sdcard'] as boolean;
		hasReport.current = (option as JSX.Element).props['data-has-report'] as boolean;
		unitName.current = (option as JSX.Element).props['data-unitname'] as string;
	};

	const resetValue = useCallback(() => {
		caseId.current = ''; //案件id
		spareName.current = '';
		casePath.current = ''; //案件存储路径
		sdCard.current = false; //是否拉取SD卡
		hasReport.current = false; //是否生成报告
		isAuto.current = false; //是否自动解析
		unitName.current = ''; //检验单位
		setSelectedApps([]);
	}, []);

	/**
	 * App选择Handle
	 * @param nodes 勾选的zTree结点
	 */
	const appSelectHandle = (nodes: ITreeNode[]) => {
		const apps = filterToParseApp(nodes);
		setSelectedApps(apps);
		setAppSelectModalVisible(false);
	};

	/**
	 * 表单提交
	 */
	const formSubmit = (e: MouseEvent<HTMLElement>) => {
		e.preventDefault();

		const { validateFields } = props.form;
		const { device } = props;

		validateFields(async (errors: any, values: FormValue) => {
			if (!errors) {
				if (selectedApps.length === 0) {
					message.info('请选择云取证App');
				} else {
					let entity = new FetchData(); //采集数据
					entity.caseName = values.case;
					entity.spareName = spareName.current;
					entity.caseId = caseId.current;
					entity.casePath = casePath.current;
					entity.sdCard = sdCard.current ?? false;
					entity.hasReport = hasReport.current ?? false;
					entity.isAuto = isAuto.current;
					entity.unitName = unitName.current;
					entity.mobileNumber = values.mobileNumber;
					entity.mobileName = `${values.phoneName}_${helper.timestamp(device?.usb)}`;
					entity.mobileNo = values.deviceNumber ?? '';
					entity.mobileHolder = values.user;
					entity.handleOfficerNo = values.handleOfficerNo;
					entity.note = values.note ?? '';
					entity.credential = '';
					entity.serial = props.device?.serial ?? '';
					entity.mode = DataMode.ServerCloud; //短信云取
					entity.appList = [];
					entity.cloudAppList = selectedApps; //云取App
					entity.cloudTimeout = values.cloudTimeout;
					entity.cloudTimespan = values.cloudTimespan;
					entity.isAlive = values.isAlive;

					try {
						let disk = casePath.current.substring(0, 2);
						const { FreeSpace } = await helper.getDiskInfo(disk, true);
						if (FreeSpace < 100) {
							Modal.confirm({
								onOk() {
									log.warn(`磁盘空间不足, ${disk}剩余: ${round(FreeSpace, 2)}GB`);
									ipcRenderer.send('show-protocol', entity);
								},
								title: '磁盘空间不足',
								content: (
									<Instruction>
										<p>
											磁盘空间仅存<strong>{round(FreeSpace, 1)}GB</strong>
											，建议清理数据
										</p>
										<p>设备数据过大可能会采集失败，继续取证？</p>
									</Instruction>
								),
								okText: '是',
								cancelText: '否',
								icon: 'info-circle',
								centered: true
							});
						} else {
							ipcRenderer.send('show-protocol', entity);
						}
					} catch (error) {
						ipcRenderer.send('show-protocol', entity);
						log.error(`读取磁盘信息失败:${(error as any).message}`);
					}
				}
			} else {
				const fieldKeys = Object.keys(errors);
				if (
					fieldKeys.some((i) => i === 'cloudTimeout') ||
					fieldKeys.some((i) => i === 'cloudTimespan')
				) {
					setActivePanelKey('1');
				}
			}
		});
	};

	const renderForm = (): JSX.Element => {
		const { Item } = Form;
		const { getFieldDecorator, setFieldsValue } = props.form;
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 18 }
		};

		return (
			<div>
				<Form layout="horizontal" {...formItemLayout}>
					<Row>
						<Col span={24}>
							<Item label="案件名称">
								{getFieldDecorator('case', {
									rules: [
										{
											required: true,
											message: '请选择案件'
										}
									]
								})(
									<Select
										onChange={caseChange}
										showSearch={true}
										notFoundContent="暂无数据"
										placeholder="选择案件，可输入案件名称查找">
										{bindCaseSelect()}
									</Select>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item
								label="选择App"
								labelCol={{ span: 8 }}
								wrapperCol={{ span: 14 }}
								required={true}>
								<Button
									onClick={() => setAppSelectModalVisible(true)}
									style={{ width: '100%' }}
									icon="select">
									{`云取证App（${selectedApps.length}）`}
								</Button>
							</Item>
						</Col>
						<Col span={12}>
							<Item label="手机号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
								{getFieldDecorator('mobileNumber', {
									rules: [
										{
											required: true,
											message: '请填写手机号'
										},
										{
											pattern: MobileNumber,
											message: '请输入正确的手机号'
										}
									]
								})(
									<AutoComplete
										dataSource={historyMobileNumber.current.reduce(
											(total: string[], current: string, index: number) => {
												if (index < 10 && current !== null) {
													total.push(current);
												}
												return total;
											},
											[]
										)}>
										<Input maxLength={16} />
									</AutoComplete>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
								{getFieldDecorator('phoneName', {
									rules: [
										{
											required: true,
											message: '请填写手机名称'
										},
										{
											pattern: Backslashe,
											message: '不允许输入斜线字符'
										},
										{ pattern: UnderLine, message: '不允许输入下划线' }
									],
									initialValue: props.device?.model
								})(
									<AutoComplete
										dataSource={historyDeviceName.current.reduce(
											(total: string[], current: string, index: number) => {
												if (index < 10 && current !== null) {
													total.push(current);
												}
												return total;
											},
											[]
										)}
									/>
								)}
							</Item>
						</Col>
						<Col span={12}>
							<Item
								label="手机持有人"
								labelCol={{ span: 6 }}
								wrapperCol={{ span: 14 }}>
								{getFieldDecorator('user', {
									rules: [
										{
											required: true,
											message: '请填写持有人'
										},
										{
											pattern: Backslashe,
											message: '不允许输入斜线字符'
										}
									]
								})(
									<AutoComplete
										dataSource={historyDeviceHolder.current.reduce(
											(total: string[], current: string, index: number) => {
												if (index < 10 && current !== null) {
													total.push(current);
												}
												return total;
											},
											[]
										)}
									/>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="手机编号" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
								{getFieldDecorator('deviceNumber', {
									rules: [
										{
											pattern: Backslashe,
											message: '不允许输入斜线字符'
										},
										{ pattern: UnderLine, message: '不允许输入下划线' }
									]
								})(
									<AutoComplete
										dataSource={historyDeviceNumber.current.reduce(
											(total: string[], current: string, index: number) => {
												if (index < 10 && current !== null) {
													total.push(current);
												}
												return total;
											},
											[]
										)}>
										<Input maxLength={3} />
									</AutoComplete>
								)}
							</Item>
						</Col>
						<Col span={12}>
							<Item
								label="检材持有人编号"
								labelCol={{ span: 6 }}
								wrapperCol={{ span: 14 }}>
								{getFieldDecorator('handleOfficerNo')(
									<Input
										maxLength={100}
										placeholder="检材持有人编号/执法办案人员编号"
									/>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item label="备注">
								{getFieldDecorator('note')(<Input maxLength={100} />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Collapse
								onChange={(key) => {
									setActivePanelKey(key as string);
								}}
								accordion={true}
								activeKey={activePanelKey}>
								<Panel
									header={
										<PanelHeader
											onResetButtonHover={(e: MouseEvent) => {
												if (activePanelKey !== '1') {
													setActivePanelKey('1');
												}
											}}
											onResetClick={(e: MouseEvent) => {
												e.stopPropagation();
												setFieldsValue({
													cloudTimeout: helper.CLOUD_TIMEOUT,
													cloudTimespan: helper.CLOUD_TIMESPAN,
													isAlive: helper.IS_ALIVE
												});
												localStorage.removeItem(LocalStoreKey.CloudTimeout);
												localStorage.removeItem(
													LocalStoreKey.CloudTimespan
												);
												localStorage.removeItem(LocalStoreKey.IsAlive);
												message.destroy();
												message.success('已还原默认值');
											}}
										/>
									}
									key="1"
									className="ant-collapse-panel-overwrite">
									<Row>
										<Col span={8}>
											<Item
												label="超时时间（秒）"
												labelCol={{ span: 12 }}
												wrapperCol={{ span: 10 }}>
												{getFieldDecorator('cloudTimeout', {
													rules: [
														{
															required: true,
															message: '请填写超时时间'
														}
													],
													initialValue: getTimeFromStorage(
														LocalStoreKey.CloudTimeout
													)
												})(
													<InputNumber
														min={0}
														precision={0}
														style={{ width: '100%' }}
													/>
												)}
											</Item>
										</Col>
										<Col span={8}>
											<Item
												label="查询间隔（秒）"
												labelCol={{ span: 12 }}
												wrapperCol={{ span: 10 }}>
												{getFieldDecorator('cloudTimespan', {
													rules: [
														{
															required: true,
															message: '请填写查询间隔'
														}
													],
													initialValue: getTimeFromStorage(
														LocalStoreKey.CloudTimespan
													)
												})(
													<InputNumber
														min={0}
														precision={0}
														style={{ width: '100%' }}
													/>
												)}
											</Item>
										</Col>
										<Col span={8}>
											<Tooltip title="不要勾选，特殊需求用">
												<Item
													label="是否保活"
													labelCol={{ span: 12 }}
													wrapperCol={{ span: 6 }}>
													{getFieldDecorator('isAlive', {
														valuePropName: 'checked',
														initialValue: getIsAliveFromStorage()
													})(<Checkbox />)}
												</Item>
											</Tooltip>
										</Col>
									</Row>
								</Panel>
							</Collapse>
						</Col>
					</Row>
				</Form>
			</div>
		);
	};

	return (
		<>
			<Modal
				visible={props.visible}
				onCancel={() => {
					resetValue();
					setActivePanelKey('0');
					props.cancelHandle!();
				}}
				footer={[
					<ModeButton
						type="default"
						icon="close-circle"
						key="B_0"
						onClick={() => {
							resetValue();
							setActivePanelKey('0');
							props.cancelHandle!();
						}}>
						取消
					</ModeButton>,
					<Tooltip title="确定后开始采集数据" key="B_1">
						<ModeButton type="primary" icon="check-circle" onClick={formSubmit}>
							确定
						</ModeButton>
					</Tooltip>
				]}
				title="取证信息录入（云取）"
				width={1000}
				maskClosable={false}
				destroyOnClose={true}
				centered={true}
				className="modal-style-update">
				<div className="server-cloud-input-modal-root">{renderForm()}</div>
			</Modal>
			<CloudAppSelectModal
				title="云取证App"
				visible={appSelectModalVisible}
				url={config.cloudAppUrl ?? helper.FETCH_CLOUD_APP_URL}
				// url="http://localhost:9900/app/cloud-app"
				selectedKeys={selectedApps.map((i) => i.m_strID)}
				okHandle={appSelectHandle}
				closeHandle={() => setAppSelectModalVisible(false)}
			/>
		</>
	);
};
ServerCloudInputModal.defaultProps = {
	visible: false,
	saveHandle: () => {},
	cancelHandle: () => {}
};

const MemoServerCloudInputModal = memo(ServerCloudInputModal, (prev: Prop, next: Prop) => {
	return !prev.visible && !next.visible;
});
const ExtendCaseInputModal = Form.create({ name: 'serverCloudCaseForm' })(
	MemoServerCloudInputModal
);
export default connect((state: StateTree) => ({
	serverCloudInputModal: state.serverCloudInputModal
}))(ExtendCaseInputModal);
