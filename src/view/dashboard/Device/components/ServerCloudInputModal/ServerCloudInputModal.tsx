import React, { FC, MouseEvent, useCallback, useEffect, useState, useRef, memo } from 'react';
import { connect } from 'dva';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import AutoComplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import { withModeButton } from '@src/components/enhance';
import AppSelectModal from '@src/components/AppSelectModal/AppSelectModal';
import { useMount } from '@src/hooks';
import log from '@utils/log';
import app from '@src/config/app.yaml';
import { helper } from '@utils/helper';
import { Backslashe, UnderLine, MobileNumber } from '@utils/regex';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { ITreeNode } from '@src/type/ztree';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';
import { DataMode } from '@src/schema/DataMode';
import { CParseApp } from '@src/schema/CParseApp';
import { Prop, FormValue } from './componentTypes';
import './ServerCloudInputModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 过滤勾选的node，返回level==2的应用结点
 * @param treeNode 勾选的zTree结点
 */
function filterToParseApp(treeNodes: ITreeNode[]) {
	return treeNodes
		.filter((node) => node.level == 2)
		.map(
			(node) =>
				new CParseApp({
					m_strID: node.id,
					m_strPktlist: node.packages
				})
		);
}

/**
 * 云取证录入窗口
 */
const ServerCloudInputModal: FC<Prop> = (props) => {
	const [appSelectModalVisible, setAppSelectModalVisible] = useState(false);
	const [selectedApps, setSelectedApps] = useState<CParseApp[]>([]);
	const caseId = useRef<string>(''); //案件id
	const casePath = useRef<string>(''); //案件存储路径
	const sdCard = useRef<boolean>(false); //是否拉取SD卡
	const hasReport = useRef<boolean>(false); //是否生成报告
	const isAuto = useRef<boolean>(false); //是否自动解析
	const unitName = useRef<string>(''); //检验单位
	const historyDeviceName = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENAME));
	const historyDeviceHolder = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER));
	const historyDeviceNumber = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER));

	useMount(() => {
		const { dispatch } = props;
		dispatch({ type: 'serverCloudInputModal/queryCaseList' });
	});

	useEffect(() => {
		historyDeviceName.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENAME);
		historyDeviceHolder.current = UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER);
		historyDeviceNumber.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER);
	}, [props.visible]);

	/**
	 * 绑定案件下拉数据
	 */
	const bindCaseSelect = useCallback(() => {
		const { caseList } = props.serverCloudInputModal!;
		const { Option } = Select;
		return caseList.map((opt: CCaseInfo) => {
			let pos = opt.m_strCaseName.lastIndexOf('\\');
			let [name, tick] = opt.m_strCaseName.substring(pos + 1).split('_');
			return (
				<Option
					value={opt.m_strCaseName.substring(pos + 1)}
					data-case-id={opt._id}
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
	}, [props.visible]);

	/**
	 * 案件下拉Change
	 */
	const caseChange = useCallback((value: string, option: JSX.Element | JSX.Element[]) => {
		caseId.current = (option as JSX.Element).props['data-case-id'] as string;
		casePath.current = (option as JSX.Element).props['data-case-path'] as string;
		isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
		sdCard.current = (option as JSX.Element).props['data-sdcard'] as boolean;
		hasReport.current = (option as JSX.Element).props['data-has-report'] as boolean;
		unitName.current = (option as JSX.Element).props['data-unitname'] as string;
	}, []);

	const resetValue = useCallback(() => {
		caseId.current = ''; //案件id
		casePath.current = ''; //案件存储路径
		sdCard.current = false; //是否拉取SD卡
		hasReport.current = false; //是否生成报告
		isAuto.current = false; //是否自动解析
		unitName.current = ''; //检验单位
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
		const { saveHandle, device } = props;

		validateFields(async (errors: any, values: FormValue) => {
			if (!errors) {
				if (selectedApps.length === 0) {
					message.info('请选择云取证App');
				} else {
					let entity = new FetchData(); //采集数据
					entity.caseName = values.case;
					entity.caseId = caseId.current;
					entity.casePath = casePath.current;
					entity.sdCard = sdCard.current ?? false;
					entity.hasReport = hasReport.current ?? false;
					entity.isAuto = isAuto.current;
					entity.unitName = unitName.current;
					entity.mobileNumber = values.mobileNumber;
					entity.mobileName = `${values.phoneName}_${helper.timestamp(device?.usb)}`;
					entity.mobileNo = helper.isNullOrUndefined(values.deviceNumber)
						? ''
						: values.deviceNumber;
					entity.mobileHolder = values.user;
					entity.note = helper.isNullOrUndefined(values.note) ? '' : values.note;
					entity.credential = '';
					entity.serial = props.device?.serial ?? '';
					entity.mode = DataMode.ServerCloud; //短信云取
					entity.appList = selectedApps.reduce(
						(acc: string[], current: any) => acc.concat(current.m_strPktlist),
						[]
					);
					try {
						const disk = await helper.getDiskInfo(
							casePath.current.substring(0, 2),
							true
						);
						if (disk.FreeSpace < 100) {
							Modal.confirm({
								onOk() {
									saveHandle!(entity);
								},
								title: '磁盘空间过低',
								content: '磁盘空间低于100GB，继续取证？',
								okText: '是',
								cancelText: '否',
								icon: 'info-circle',
								centered: true
							});
						} else {
							saveHandle!(entity);
						}
					} catch (error) {
						saveHandle!(entity);
						log.error(`读取磁盘信息失败:${error.message}`);
					}
				}
			}
		});
	};

	const renderForm = (): JSX.Element => {
		const { Item } = Form;
		const { getFieldDecorator } = props.form;
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
										notFoundContent="暂无数据"
										placeholder="选择一个案件"
										onChange={caseChange}>
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
									icon="cloud-sync">
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
								})(<Input />)}
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
							<Item label="备注" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
								{getFieldDecorator('note')(<Input maxLength={100} />)}
							</Item>
						</Col>
					</Row>
				</Form>
			</div>
		);
	};

	return (
		<>
			<Modal
				width={1000}
				visible={props.visible}
				title="取证信息录入（云取）"
				maskClosable={false}
				destroyOnClose={true}
				className="modal-style-update"
				onCancel={() => {
					resetValue();
					props.cancelHandle!();
				}}
				footer={[
					<ModeButton
						type="default"
						icon="close-circle"
						key="B_0"
						onClick={() => {
							setSelectedApps([]);
							props.cancelHandle!();
						}}>
						取消
					</ModeButton>,
					<Tooltip title="确定后开始采集数据" key="B_1">
						<ModeButton type="primary" icon="check-circle" onClick={formSubmit}>
							确定
						</ModeButton>
					</Tooltip>
				]}>
				<div className="server-cloud-input-modal-root">{renderForm()}</div>
			</Modal>
			<AppSelectModal
				visible={appSelectModalVisible}
				treeData={app.fetch}
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
export default connect((state: any) => ({ serverCloudInputModal: state.serverCloudInputModal }))(
	ExtendCaseInputModal
);
