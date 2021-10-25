import React, { FC, MouseEvent, useCallback, useRef, memo } from 'react';
import { connect } from 'dva';
import round from 'lodash/round';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { Backslashe, UnderLine } from '@utils/regex';
import { useMount } from '@src/hooks';
import { StateTree } from '@src/type/model';
import { withModeButton } from '@src/components/enhance';
import Instruction from '@src/components/Instruction';
import CCaseInfo from '@src/schema/CCaseInfo';
import FetchData from '@src/schema/socket/FetchData';
import { DataMode } from '@src/schema/DataMode';
import { Prop, FormValue } from './componentTypes';
import './CheckInputModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 采集录入框（点验模式）
 */
const CheckInputModal: FC<Prop> = (props) => {
	const caseId = useRef<string>(''); //案件id
	const spareName = useRef<string>(''); //案件备用名
	const casePath = useRef<string>(''); //案件存储路径
	const appList = useRef<any[]>([]); //解析App
	const sdCard = useRef<boolean>(false); //是否拉取SD卡
	const hasReport = useRef<boolean>(false); //是否生成报告
	const isAuto = useRef<boolean>(false); //是否自动解析
	const unitName = useRef<string>(''); //检验单位

	useMount(() => {
		const { dispatch } = props;
		dispatch({ type: 'checkInputModal/queryCaseList' });
	});

	/**
	 * 绑定案件下拉数据
	 */
	const bindCaseSelect = () => {
		const { caseList } = props.checkInputModal!;
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
		appList.current = (option as JSX.Element).props['data-app-list'] as any[];
		sdCard.current = (option as JSX.Element).props['data-sdcard'] as boolean;
		hasReport.current = (option as JSX.Element).props['data-has-report'] as boolean;
		isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
		unitName.current = (option as JSX.Element).props['data-unitname'] as string;
	};

	const resetValue = useCallback(() => {
		caseId.current = ''; //案件id
		spareName.current = '';
		casePath.current = ''; //案件存储路径
		appList.current = []; //解析App
		sdCard.current = false; //拉取SD卡
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
		const { dispatch, saveHandle, device } = props;

		validateFields(async (errors: any, values: FormValue) => {
			if (!errors) {
				let entity = new FetchData(); //采集数据
				entity.caseName = values.case;
				entity.caseId = caseId.current;
				entity.spareName = spareName.current;
				entity.casePath = casePath.current;
				entity.sdCard = sdCard.current ?? false;
				entity.hasReport = hasReport.current ?? false;
				entity.isAuto = isAuto.current;
				entity.unitName = unitName.current;
				entity.mobileName = `${values.phoneName}_${helper.timestamp(device?.usb)}`;
				entity.mobileNo = ''; //点验版本不需要填写编号
				entity.mobileHolder = values.user; //姓名
				entity.credential = values.credential; //身份证/军官证号
				entity.handleOfficerNo = '';
				entity.note = values.note; //设备手机号
				entity.serial = props.device?.serial ?? ''; //序列号
				entity.mode = DataMode.Check; //点验版本
				entity.appList = appList.current;
				entity.cloudAppList = [];
				try {
					let disk = casePath.current.substring(0, 2);
					const { FreeSpace } = await helper.getDiskInfo(disk, true);
					if (FreeSpace < 100) {
						Modal.confirm({
							onOk() {
								log.warn(`磁盘空间不足, ${disk}剩余: ${round(FreeSpace, 2)}GB`);
								//点验设备入库
								dispatch({
									type: 'checkInputModal/insertCheckData',
									payload: entity
								});
								saveHandle!(entity);
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
						//点验设备入库
						dispatch({ type: 'checkInputModal/insertCheckData', payload: entity });
						saveHandle!(entity);
					}
				} catch (error) {
					//点验设备入库
					dispatch({ type: 'checkInputModal/insertCheckData', payload: entity });
					saveHandle!(entity);
					log.error(`读取磁盘信息失败:${(error as any).message}`);
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
							<Item label="姓名" labelCol={{ span: 8 }} wrapperCol={{ span: 13 }}>
								{getFieldDecorator('user', {
									rules: [
										{
											required: true,
											message: '请填写姓名'
										},
										{
											pattern: Backslashe,
											message: '不允许输入斜线字符'
										}
									]
								})(<Input />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item
								label="身份证/军官证号"
								labelCol={{ span: 7 }}
								wrapperCol={{ span: 13 }}>
								{getFieldDecorator('credential', {
									rules: [
										{
											required: true,
											message: '请填写身份证/军官证号'
										}
									]
								})(<Input />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 13 }}>
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
								})(<Input />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item
								label="设备手机号"
								labelCol={{ span: 7 }}
								wrapperCol={{ span: 13 }}>
								{getFieldDecorator('note', {
									rules: [
										{
											required: true,
											message: '请填写设备手机号'
										}
									]
								})(<Input maxLength={100} />)}
							</Item>
						</Col>
					</Row>
				</Form>
			</div>
		);
	};

	return (
		<div className="case-input-modal-root">
			<Modal
				visible={props.visible}
				onCancel={() => {
					resetValue();
					props.cancelHandle!();
				}}
				footer={[
					<ModeButton
						type="default"
						icon="close-circle"
						key="B_1"
						onClick={() => {
							props.cancelHandle!();
						}}>
						取消
					</ModeButton>,
					<Tooltip title="确定后开始采集数据" key="B_2">
						<ModeButton type="primary" icon="check-circle" onClick={formSubmit}>
							确定
						</ModeButton>
					</Tooltip>
				]}
				title="取证信息录入（点验）"
				width={1000}
				maskClosable={false}
				destroyOnClose={true}
				centered={true}
				className="modal-style-update">
				<div>{renderForm()}</div>
			</Modal>
		</div>
	);
};
CheckInputModal.defaultProps = {
	visible: false,
	saveHandle: () => {},
	cancelHandle: () => {}
};

const MemoCheckInputModal = memo(CheckInputModal, (prev: Prop, next: Prop) => {
	return !prev.visible && !next.visible;
});
const ExtendCheckInputModal = Form.create({ name: 'checkForm' })(MemoCheckInputModal);
export default connect((state: StateTree) => ({ checkInputModal: state.checkInputModal }))(
	ExtendCheckInputModal
);
