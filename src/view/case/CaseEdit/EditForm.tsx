import React, { forwardRef, useState, useEffect } from 'react';
import Button from 'antd/lib/button';
import Form, { FormComponentProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Select from 'antd/lib/select';
import Switch from 'antd/lib/switch';
import AutoComplete from 'antd/lib/auto-complete';
import Empty from 'antd/lib/empty';
import Tooltip from 'antd/lib/tooltip';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import AppSelectModal from '@src/components/AppSelectModal/AppSelectModal';
import { helper } from '@utils/helper';
import { AllowCaseName, UnderLine } from '@src/utils/regex';
import { caseType } from '@src/schema/CaseType';
import { CParseApp } from '@src/schema/CParseApp';
import CCaseInfo from '@src/schema/CCaseInfo';
import parseApp from '@src/config/parse-app.yaml';
import tokenApp from '@src/config/token-app.yaml';
import { filterToParseApp } from '../helper';
import { Context } from './ComponentType';
import CheckboxBar from '../CaseEdit/CheckboxBar';

const { Group } = Button;
const { Item } = Form;
const formItemLayout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 18 }
};
const { useBcp, useAi, caseText, fetchText, parseText } = helper.readConf();

interface EditFormProp extends FormComponentProps {
	/**
	 * 数据
	 */
	data: CCaseInfo;
	/**
	 * 单位名称记录
	 */
	historyUnitNames: string[];
	/**
	 * 上下文
	 */
	context: Context;
}

const getCaseName = (caseName?: string) => {
	if (helper.isNullOrUndefined(caseName)) {
		return '';
	} else {
		return caseName!.split('_')[0];
	}
};

/**
 * 将JSON数据转为Options元素
 * @param data JSON数据
 */
const getOptions = (data: Record<string, string | number>[]): JSX.Element[] => {
	const { Option } = Select;
	return data.map<JSX.Element>((item: Record<string, string | number>, i) => (
		<Option value={item.value} key={`Opt_${i}`}>
			{item.name}
		</Option>
	));
};

/**
 * 表单
 */
const EditForm = Form.create<EditFormProp>()(
	forwardRef<Form, EditFormProp>((props, ref) => {
		const { data, historyUnitNames, context } = props;
		const { getFieldDecorator } = props.form;
		const [parseAppList, setParseAppList] = useState<CParseApp[]>([]);
		const [tokenAppList, setTokenAppList] = useState<CParseApp[]>([]);
		const [parseAppSelectModalVisible, setParseAppSelectModalVisible] =
			useState<boolean>(false); //解析App选择框
		const [tokenAppSelectModalVisible, setTokenAppSelectModalVisible] =
			useState<boolean>(false); //云取证App选择框

		useEffect(() => {
			if (parseAppList.length === 0) {
				//首次加载时，将数据库中案件的解析应用列表数据赋值给parseAppList
				setParseAppList(data.m_Applist ? data.m_Applist : []);
			}
			context.parseAppSelectHandle(data.m_Applist ? data.m_Applist : []);
		}, [data.m_Applist]);
		useEffect(() => {
			if (tokenAppList.length === 0) {
				//首次加载时，将数据库中案件的云取证应用列表数据赋值给cloudAppList
				setTokenAppList(data.tokenAppList ? data.tokenAppList : []);
			}
			context.tokenAppSelectHandle(data.tokenAppList ? data.tokenAppList : []);
		}, [data.tokenAppList]);

		return (
			<>
				<Form {...formItemLayout}>
					<Row>
						<Col span={24}>
							<Item label={`${caseText ?? '案件'}名称`}>
								{getFieldDecorator('currentCaseName', {
									rules: [{ required: true, message: `请填写${caseText ?? '案件'}名称` }],
									initialValue: getCaseName(data.m_strCaseName)
								})(
									<Input
										prefix={<Icon type="profile" />}
										maxLength={30}
										disabled={true}
									/>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item label={`备用${caseText ?? '案件'}名称`}>
								{getFieldDecorator('spareName', {
									rules: [{ pattern: AllowCaseName, message: '不允许输入非法字符' }],
									initialValue: data.spareName ?? ''
								})(
									<Input
										placeholder={`备用${caseText ?? '案件'}名称将代替原案件名称`}
										prefix={<Icon type="profile" />}
										maxLength={30}
									/>
								)}
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
									],
									initialValue: data.m_strCasePath
								})(
									<Input
										addonAfter={<Icon type="ellipsis" />}
										disabled={true}
										readOnly={true}
									/>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item label="检验单位">
								{getFieldDecorator('m_strCheckUnitName', {
									rules: [{ required: true, message: '请填写检验单位' }],
									initialValue: data.m_strCheckUnitName
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
										icon="file-sync"
										onClick={() => setParseAppSelectModalVisible(true)}>
										{`解析App（${parseAppList.length}）`}
									</Button>
									<Button
										icon="cloud-sync"
										onClick={() => setTokenAppSelectModalVisible(true)}>
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
						style={{ display: useBcp && data.generateBcp ? 'block' : 'none' }}>
						<div className="bcp-list-bar">
							<Icon type="appstore" rotate={45} />
							<span>BCP信息</span>
						</div>
						<Row>
							<Col span={12}>
								<Item
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 14 }}
									label={`${fetchText ?? '采集'}人员`}>
									{getFieldDecorator('officerNo', {
										rules: [
											{
												required: data.generateBcp,
												message: `请选择${fetchText ?? '采集'}人员`
											}
										],
										initialValue: context.getOfficerInitVal(data.officerNo)
									})(
										<Select
											onChange={context.officerChange}
											notFoundContent={
												<Empty
													description={`暂无${fetchText ?? '采集'}人员`}
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
									{getFieldDecorator('securityCaseNo', {
										initialValue: data.securityCaseNo
									})(<Input />)}
								</Item>
							</Col>
							<Col span={12}>
								<Item
									label="网安部门案件类别"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('securityCaseType', {
										initialValue: data.securityCaseType ?? ''
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
									{getFieldDecorator('securityCaseName', {
										initialValue: data.securityCaseName
									})(<Input />)}
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<Item
									label="执法办案系统案件编号"
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleCaseNo', {
										initialValue: data.handleCaseNo
									})(<Input />)}
								</Item>
							</Col>
							<Col span={12}>
								<Item
									label="执法办案系统案件类别"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleCaseType', {
										initialValue: data.handleCaseType
									})(<Input />)}
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={24}>
								<Item
									label="执法办案系统案件名称"
									labelCol={{ span: 4 }}
									wrapperCol={{ span: 18 }}>
									{getFieldDecorator('handleCaseName', {
										initialValue: data.handleCaseName
									})(<Input />)}
								</Item>
							</Col>
							{/* <Col span={12}>
								<Item
									label="执法办案人员编号"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleOfficerNo', {
										initialValue: data.handleOfficerNo
									})(<Input />)}
								</Item>
							</Col> */}
						</Row>
					</div>
					<div
						className="bcp-list"
						style={{ display: useAi && data.isAi ? 'block' : 'none' }}>
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
											initialValue: data.aiThumbnail
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
											initialValue: data.aiWeapon
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
											initialValue: data.aiDoc
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
										initialValue: data.aiDrug
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
										initialValue: data.aiNude
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
											initialValue: data.aiMoney
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
											initialValue: data.aiDress
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
											initialValue: data.aiTransport
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
											initialValue: data.aiCredential
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
											initialValue: data.aiTransfer
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
											initialValue: data.aiScreenshot
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
					treeData={parseApp.fetch}
					selectedKeys={parseAppList.map((i) => i.m_strID)}
					okHandle={(data) => {
						const selectApps = filterToParseApp(data);
						setParseAppList(selectApps);
						context.parseAppSelectHandle(selectApps);
						setParseAppSelectModalVisible(false);
					}}
					closeHandle={() => {
						setParseAppList(data.m_Applist ?? []);
						setParseAppSelectModalVisible(false);
					}}
					title={`${parseText ?? '解析'}App`}>
					<fieldset>
						<legend>{parseText ?? '解析'}App</legend>
						<ul>
							<li>不勾选App默认拉取所有应用</li>
						</ul>
					</fieldset>
				</AppSelectModal>
				{/* 云取证App选择框 */}
				<AppSelectModal
					visible={tokenAppSelectModalVisible}
					treeData={tokenApp.fetch}
					selectedKeys={tokenAppList.map((i) => i.m_strID)}
					okHandle={(data) => {
						const selectApps = filterToParseApp(data);
						setTokenAppList(selectApps);
						context.tokenAppSelectHandle(selectApps);
						setTokenAppSelectModalVisible(false);
					}}
					closeHandle={() => {
						setTokenAppList(data.tokenAppList ?? []);
						setTokenAppSelectModalVisible(false);
					}}
					title="Token云取证App">
					<fieldset>
						<legend>Token云取App（目前只支持 Android 设备）</legend>
						<ul>
							<li>Token云取证App必须包含在{parseText ?? '解析'}App列表中</li>
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

export { EditFormProp };
export default EditForm;
