import React, { MouseEvent, memo, useState, forwardRef, useCallback } from 'react';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import throttle from 'lodash/throttle';
import AutoComplete from 'antd/lib/auto-complete';
import Button from 'antd/lib/button';
import Switch from 'antd/lib/switch';
import Form, { FormComponentProps } from 'antd/lib/form';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Tooltip from 'antd/lib/tooltip';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import AppSelectModal from '@src/components/AppSelectModal/AppSelectModal';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { AllowCaseName } from '@utils/regex';
import { caseType } from '@src/schema/CaseType';
import { BaseApp } from '@src/schema/socket/BaseApp';
import parseAppData from '@src/config/parse-app.yaml';
import tokenAppData from '@src/config/token-app.yaml';
import { Context, State } from './componentType';
import { filterToParseApp } from '../helper';
import CheckboxBar from './CheckboxBar';

const { Option } = Select;
const { Group } = Button;
const { Search } = Input;
const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 18 }
};
const { useBcp, useAi } = helper.readConf();

interface AddFormProp extends FormComponentProps {
	/**
	 * 父组件CassAdd参数
	 */
	parameter: State;
	/**
	 * 上下文
	 */
	context: Context;
}

const AddForm = Form.create<AddFormProp>()(
	forwardRef<Form, AddFormProp>((props: AddFormProp) => {
		const { getFieldDecorator } = props.form;
		const { context } = props;
		const { historyUnitNames, generateBcp, isAi } = props.parameter;
		const [isCheck, setIsCheck] = useState(false);
		const [parseAppList, setParseAppList] = useState<BaseApp[]>([]);
		const [tokenAppList, setTokenAppList] = useState<BaseApp[]>([]);
		const [parseAppSelectModalVisible, setParseAppSelectModalVisible] =
			useState<boolean>(false); //解析App选择框
		const [tokenAppSelectModalVisible, setTokenAppSelectModalVisible] =
			useState<boolean>(false); //云取证App选择框

		/**
		 * 选择案件路径Handle
		 */
		const selectDirHandle = useCallback((event: MouseEvent<HTMLInputElement>) => {
			const { setFieldsValue } = props.form;
			ipcRenderer
				.invoke('open-dialog', {
					properties: ['openDirectory']
				})
				.then((val: OpenDialogReturnValue) => {
					if (val.filePaths && val.filePaths.length > 0) {
						setFieldsValue({ m_strCasePath: val.filePaths[0] });
					}
				});
		}, []);

		/**
		 * 验证案件重名
		 */
		const validCaseNameExists = throttle((rule: any, value: string, callback: any) => {
			setIsCheck(true);
			let next = value === '..' ? '.' : value;
			helper
				.caseNameExist(next)
				.then(({ length }) => {
					if (length > 0) {
						callback(new Error('案件名称已存在'));
					} else {
						callback();
					}
					setIsCheck(false);
				})
				.catch((e) => {
					log.error(
						`检测案件重名失败 @view/case/CaseAdd/addForm.tsx/validCaseNameExists: ${e.message}`
					);
					callback();
					setIsCheck(false);
				});
		}, 400);

		/**
		 * 将JSON数据转为Options元素
		 * @param data JSON数据
		 */
		const getOptions = (data: Record<string, string>[]) =>
			data.map((item) => (
				<Option value={item.value} key={item.value}>
					{item.name}
				</Option>
			));

		return (
			<>
				<Form {...formItemLayout}>
					<Row>
						<Col span={24}>
							<Item label="案件名称">
								{getFieldDecorator('currentCaseName', {
									rules: [
										{ required: true, message: '请填写案件名称' },
										{ pattern: AllowCaseName, message: '不允许输入非法字符' },
										{
											validator: validCaseNameExists,
											message: '案件名称已存在'
										}
									]
								})(<Search maxLength={30} loading={isCheck} />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item label="存储路径">
								{getFieldDecorator('m_strCasePath', {
									rules: [
										{
											required: true,
											message: '请选择存储路径'
										}
									]
								})(
									<Input
										addonAfter={
											<Icon type="ellipsis" onClick={selectDirHandle} />
										}
										readOnly={true}
										onClick={selectDirHandle}
									/>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item label="检验单位">
								{getFieldDecorator('checkUnitName', {
									rules: [{ required: true, message: '请填写检验单位' }],
									initialValue:
										helper.isNullOrUndefined(historyUnitNames) ||
										historyUnitNames.length === 0
											? ''
											: historyUnitNames[0]
								})(
									<AutoComplete
										dataSource={
											helper.isNullOrUndefined(historyUnitNames)
												? []
												: historyUnitNames.reduce(
														(
															total: string[],
															current: string,
															index: number
														) => {
															if (
																index < 10 &&
																!helper.isNullOrUndefinedOrEmptyString(
																	current
																)
															) {
																total.push(current);
															}
															return total;
														},
														[]
												  )
										}
									/>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item label="选择App">
								<Group>
									<Button
										onClick={() => setParseAppSelectModalVisible(true)}
										icon="file-sync">
										{`解析App（${parseAppList.length}）`}
									</Button>
									<Button
										onClick={() => setTokenAppSelectModalVisible(true)}
										icon="cloud-sync">
										{`Token云取证App（${tokenAppList.length}）`}
									</Button>
								</Group>
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<CheckboxBar {...props} />
						</Col>
					</Row>
					<div
						className="bcp-list"
						style={{ display: useBcp && generateBcp ? 'block' : 'none' }}>
						<div className="bcp-list-bar">
							<Icon type="appstore" rotate={45} />
							<span>BCP信息</span>
						</div>
						<Row>
							<Col span={12}>
								<Item
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 14 }}
									label="采集人员">
									{getFieldDecorator('officerNo', {
										rules: [
											{
												required: generateBcp,
												message: '请选择采集人员'
											}
										]
									})(
										<Select
											onChange={context.officerChange}
											notFoundContent={
												<Empty
													description="暂无采集人员"
													image={Empty.PRESENTED_IMAGE_SIMPLE}
												/>
											}>
											{context.bindOfficerOptions()}
										</Select>
									)}
								</Item>
							</Col>
							<Col span={12} />
						</Row>
						<Row>
							<Col span={12}>
								<Item
									label="网安部门案件编号"
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('securityCaseNo')(<Input />)}
								</Item>
							</Col>
							<Col span={12}>
								<Item
									label="网安部门案件类别"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('securityCaseType', {
										initialValue: ''
									})(<Select>{getOptions(caseType)}</Select>)}
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={24}>
								<Item
									label="网安部门案件名称"
									labelCol={{ span: 4 }}
									wrapperCol={{ span: 18 }}>
									{getFieldDecorator('securityCaseName')(<Input />)}
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<Item
									label="执法办案系统案件编号"
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleCaseNo')(<Input />)}
								</Item>
							</Col>
							<Col span={12}>
								<Item
									label="执法办案系统案件类别"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleCaseType')(<Input />)}
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={24}>
								<Item
									label="执法办案系统案件名称"
									labelCol={{ span: 4 }}
									wrapperCol={{ span: 18 }}>
									{getFieldDecorator('handleCaseName')(<Input />)}
								</Item>
							</Col>
							{/* <Col span={12}>
								<Item
									label="执法办案人员编号"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleOfficerNo')(<Input />)}
								</Item>
							</Col> */}
						</Row>
					</div>
					<div className="bcp-list" style={{ display: useAi && isAi ? 'block' : 'none' }}>
						<div className="bcp-list-bar">
							<Icon type="appstore" rotate={45} />
							<span>AI信息</span>
						</div>
						<Row>
							<Col span={2} />
							<Col span={3}>
								<Tooltip title="缩略图是指聊天应用接收到，未点击查看的图片，该类型图片识别度较低，数量较多">
									<Item
										label="分析缩略图"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiThumbnail', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={3}>
								<Tooltip title="刀具，大炮，坦克，枪械，军舰，子弹">
									<Item
										label="武器类"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiWeapon', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={3}>
								<Tooltip title="文件，红头文件，盖章文件，二维码">
									<Item
										label="文档类"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiDoc', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={3}>
								<Item
									label="毒品类"
									labelCol={{ span: 12 }}
									wrapperCol={{ span: 4 }}>
									{getFieldDecorator('aiDrug', {
										valuePropName: 'checked',
										initialValue: true
									})(<Switch size="small" />)}
								</Item>
							</Col>
							<Col span={3}>
								<Item
									label="裸体类"
									labelCol={{ span: 12 }}
									wrapperCol={{ span: 4 }}>
									{getFieldDecorator('aiNude', {
										valuePropName: 'checked',
										initialValue: true
									})(<Switch size="small" />)}
								</Item>
							</Col>
							<Col span={3}>
								<Tooltip title="货币">
									<Item
										label="货币类"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiMoney', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={3}>
								<Tooltip title="军装">
									<Item
										label="着装类"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiDress', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
						</Row>
						<Row>
							<Col span={2} />
							<Col span={3}>
								<Tooltip title="汽车，飞机">
									<Item
										label="交通工具"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiTransport', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={3}>
								<Tooltip title="银行卡，证件，证书执照">
									<Item
										label="证件类"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiCredential', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={3}>
								<Tooltip title="交易记录，聊天记录，转账红包">
									<Item
										label="聊天转帐类"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiTransfer', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={3}>
								<Tooltip title="截图，人像，照片">
									<Item
										label="照片截图"
										labelCol={{ span: 12 }}
										wrapperCol={{ span: 4 }}>
										{getFieldDecorator('aiScreenshot', {
											valuePropName: 'checked',
											initialValue: true
										})(<Switch size="small" />)}
									</Item>
								</Tooltip>
							</Col>
							<Col span={10} />
						</Row>
					</div>
				</Form>
				{/* 解析App选择框 */}
				<AppSelectModal
					visible={parseAppSelectModalVisible}
					treeData={parseAppData.fetch}
					selectedKeys={parseAppList.map((i) => i.m_strID)}
					okHandle={(data) => {
						const selectApps = filterToParseApp(data);
						setParseAppList(selectApps);
						context.parseAppSelectHandle(selectApps);
						setParseAppSelectModalVisible(false);
					}}
					closeHandle={() => {
						setParseAppList([]);
						setParseAppSelectModalVisible(false);
					}}
					title="解析App">
					<fieldset>
						<legend>解析App</legend>
						<ul>
							<li>不勾选App默认拉取所有应用</li>
						</ul>
					</fieldset>
				</AppSelectModal>

				{/* 云取证App选择框 */}
				<AppSelectModal
					visible={tokenAppSelectModalVisible}
					treeData={tokenAppData.fetch}
					selectedKeys={tokenAppList.map((i) => i.m_strID)}
					okHandle={(data) => {
						const selectApps = filterToParseApp(data);
						setTokenAppList(selectApps);
						context.tokenAppSelectHandle(selectApps);
						setTokenAppSelectModalVisible(false);
					}}
					closeHandle={() => {
						setTokenAppList([]);
						setTokenAppSelectModalVisible(false);
					}}
					title="Token云取证App">
					<fieldset>
						<legend>Token云取App（目前只支持 Android 设备）</legend>
						<ul>
							<li>Token云取证App必须包含在解析App列表中</li>
							<li>
								微信——先要先在手机端打开微信, 并且进入账单（此过程手机会联网）,
								在手机上看到账单正常加载之后, 再进行取证
							</li>
							<li>其他App没有特殊说明的按正常取证流程, 取证后会自动进行云取</li>
						</ul>
					</fieldset>
				</AppSelectModal>
			</>
		);
	})
);

export { AddFormProp };
export default memo(AddForm);
