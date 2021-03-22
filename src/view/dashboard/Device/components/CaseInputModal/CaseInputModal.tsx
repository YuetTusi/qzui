import React, { FC, MouseEvent, useCallback, useEffect, useRef, useState, memo } from 'react';
import { connect } from 'dva';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import AutoComplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import { useMount } from '@src/hooks';
import { StateTree } from '@src/type/model';
import { ITreeNode } from '@src/type/ztree';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { Backslashe, UnderLine } from '@utils/regex';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { withModeButton } from '@src/components/enhance';
import AppSelectModal from '@src/components/AppSelectModal/AppSelectModal';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';
import { DataMode } from '@src/schema/DataMode';
import { CParseApp } from '@src/schema/CParseApp';
import { Prop, FormValue } from './componentTypes';
import parseApp from '@src/config/parse-app.yaml';
import './CaseInputModal.less';


const { Item } = Form;
const ModeButton = withModeButton()(Button);

/**
 * 过滤勾选的node，返回level==2的应用结点
 * @param treeNode 勾选的zTree结点
 */
function filterToParseApp(treeNodes: ITreeNode[]) {
	return treeNodes
		.filter((node) => node.level == 2)
		.map((node) => {
			return new CParseApp({
				m_strID: node.id,
				m_strPktlist: node.packages
			});
		});
}

/**
 * 采集录入框（准备流程）
 */
const CaseInputModal: FC<Prop> = (props) => {
	const caseId = useRef<string>(''); //案件id
	const casePath = useRef<string>(''); //案件存储路径
	const appList = useRef<any[]>([]); //解析App
	const sdCard = useRef<boolean>(false); //是否拉取SD卡
	const hasReport = useRef<boolean>(false); //是否生成报告
	const isAuto = useRef<boolean>(false); //是否自动解析
	const unitName = useRef<string>(''); //检验单位
	const [appSelectModalVisible, setAppSelectModalVisible] = useState(false);
	const [selectedApps, setSelectedApps] = useState<CParseApp[]>([]);
	const historyDeviceName = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENAME));
	const historyDeviceHolder = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER));
	const historyDeviceNumber = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER));

	useMount(() => {
		const { dispatch } = props;
		dispatch({ type: 'caseInputModal/queryCaseList' });
	});

	useEffect(() => {
		historyDeviceName.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENAME);
		historyDeviceHolder.current = UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER);
		historyDeviceNumber.current = UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER);
	}, [props.visible]);

	/**
	 * 绑定案件下拉数据
	 */
	const bindCaseSelect = () => {
		const { caseList } = props.caseInputModal!;
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
	};

	/**
	 * 案件下拉Change
	 */
	const caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
		caseId.current = (option as JSX.Element).props['data-case-id'] as string;
		casePath.current = (option as JSX.Element).props['data-case-path'] as string;
		appList.current = (option as JSX.Element).props['data-app-list'] as any[];
		isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
		sdCard.current = (option as JSX.Element).props['data-sdcard'] as boolean;
		hasReport.current = (option as JSX.Element).props['data-has-report'] as boolean;
		unitName.current = (option as JSX.Element).props['data-unitname'] as string;
	};

	/**
	 * App选择Handle
	 * @param nodes 勾选的zTree结点
	 */
	const appSelectHandle = (nodes: ITreeNode[]) => {
		const apps = filterToParseApp(nodes);
		setSelectedApps(apps);
		setAppSelectModalVisible(false);
	};

	const resetValue = useCallback(() => {
		caseId.current = ''; //案件id
		casePath.current = ''; //案件存储路径
		appList.current = []; //解析App
		sdCard.current = false; //是否拉取SD卡
		hasReport.current = false; //是否生成报告
		isAuto.current = false; //是否自动解析
		unitName.current = ''; //检验单位
	}, []);

	/**
	 * 表单提交
	 */
	const formSubmit = (e: MouseEvent<HTMLElement>) => {
		e.preventDefault();

		const { validateFields } = props.form;
		const { saveHandle, device } = props;

		validateFields(async (errors: any, values: FormValue) => {
			if (!errors) {
				let entity = new FetchData(); //采集数据
				entity.caseName = values.case;
				entity.caseId = caseId.current;
				entity.casePath = casePath.current;
				entity.sdCard = sdCard.current ?? false;
				entity.hasReport = hasReport.current ?? false;
				entity.isAuto = isAuto.current;
				entity.unitName = unitName.current;
				entity.mobileName = `${values.phoneName}_${helper.timestamp(device?.usb)}`;
				entity.mobileNo = helper.isNullOrUndefined(values.deviceNumber)
					? ''
					: values.deviceNumber;
				entity.mobileHolder = values.user;
				entity.note = helper.isNullOrUndefined(values.note) ? '' : values.note;
				entity.credential = '';
				entity.serial = props.device?.serial ?? '';
				entity.mode = DataMode.Self; //标准模式（用户手输取证数据）
				entity.appList = selectedApps.length === 0 ? appList.current : selectedApps; //若未选择解析应用，以案件配置的应用为准
				entity.cloudAppList = [];

				try {
					const { FreeSpace } = await helper.getDiskInfo(
						casePath.current.substring(0, 2),
						true
					);
					if (FreeSpace < 100) {
						Modal.confirm({
							onOk() {
								saveHandle!(entity);
							},
							title: '磁盘空间不足',
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
		});
	};

	const renderForm = (): JSX.Element => {
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
							<Item label="选择App" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
								<Button
									onClick={() => setAppSelectModalVisible(true)}
									style={{ width: '100%' }}
									icon="select">
									{`解析App（${selectedApps.length}）`}
								</Button>
							</Item>
						</Col>
						<Col span={12}>
							<div className="app-tips">未选择App以「所属案件配置」为准</div>
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
				title="取证信息录入"
				maskClosable={false}
				destroyOnClose={true}
				className="case-input-modal-root"
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
				<div>{renderForm()}</div>
			</Modal>
			<AppSelectModal
				title="解析App"
				visible={appSelectModalVisible}
				treeData={parseApp.fetch}
				selectedKeys={selectedApps.map((i) => i.m_strID)}
				okHandle={appSelectHandle}
				closeHandle={() => setAppSelectModalVisible(false)}
			/>
		</>
	);
};
CaseInputModal.defaultProps = {
	visible: false,
	saveHandle: () => {},
	cancelHandle: () => {}
};

const MemoCaseInputModal = memo(CaseInputModal, (prev: Prop, next: Prop) => {
	return !prev.visible && !next.visible;
});
const ExtendCaseInputModal = Form.create({ name: 'caseForm' })(MemoCaseInputModal);
export default connect((state: StateTree) => ({ caseInputModal: state.caseInputModal }))(
	ExtendCaseInputModal
);
