import React, { forwardRef, useState, useEffect } from 'react';
import Button from 'antd/lib/button';
import Form, { FormComponentProps } from 'antd/lib/form';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Select from 'antd/lib/select';
import AutoComplete from 'antd/lib/auto-complete';
import Empty from 'antd/lib/empty';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Tooltip from 'antd/lib/tooltip';
import AppSelectModal from '@src/components/AppSelectModal/AppSelectModal';
import { helper } from '@utils/helper';
import { LeftUnderline } from '@utils/regex';
import { UseMode } from '@src/schema/UseMode';
import { caseType } from '@src/schema/CaseType';
import { CParseApp } from '@src/schema/CParseApp';
import CCaseInfo from '@src/schema/CCaseInfo';
import app from '@src/config/app.yaml';
import cloud from '@src/config/cloud.yaml';
import { filterToParseApp } from '../helper';
const config = helper.readConf();
const { Group } = Button;

/**
 * CaseEdit组件上下文
 */
interface Context {
	/**
	 * 拉取SD卡Change事件
	 */
	sdCardChange: (e: CheckboxChangeEvent) => void;
	/**
	 * 生成报告Change事件
	 */
	hasReportChange: (e: CheckboxChangeEvent) => void;
	/**
	 * 自动解析Change事件
	 */
	autoParseChange: (e: CheckboxChangeEvent) => void;
	/**
	 * 生成BCPChange事件
	 */
	generateBcpChange: (e: CheckboxChangeEvent) => void;
	/**
	 * 有无附件Change事件
	 */
	attachmentChange: (e: CheckboxChangeEvent) => void;
	/**
	 * 是否删除原数据Change事件
	 */
	isDelChange: (e: CheckboxChangeEvent) => void;
	/**
	 * 采集人员Change事件
	 */
	officerChange: (
		value: string,
		option: React.ReactElement<any> | React.ReactElement<any>[]
	) => void;
	/**
	 * 绑定采集人员Options
	 */
	bindOfficerOptions: () => JSX.Element;
	/**
	 * 采集人员初始化值
	 */
	getOfficerInitVal: (officerNo: string) => void;
	/**
	 * 解析App选择Handle
	 */
	parseAppSelectHandle: (nodes: CParseApp[]) => void;
	/**
	 * 云取证App选择Handle
	 */
	cloudAppSelectHandle: (nodes: CParseApp[]) => void;
}

interface Prop extends FormComponentProps {
	/**
	 * 数据
	 */
	data: CCaseInfo;
	/**
	 * 单位名称记录
	 */
	historyUnitNames: string[];
	context: Context;
}

const getCaseName = (caseName?: string) => {
	if (helper.isNullOrUndefined(caseName)) {
		return '';
	} else {
		return caseName!.match(LeftUnderline)![0];
	}
};

/**
 * 将JSON数据转为Options元素
 * @param data JSON数据
 */
const getOptions = (data: Record<string, string | number>[]): JSX.Element[] => {
	const { Option } = Select;
	return data.map<JSX.Element>((item: Record<string, string | number>) => (
		<Option value={item.value} key={helper.getKey()}>
			{item.name}
		</Option>
	));
};

/**
 * 表单
 */
const EditForm = Form.create<Prop>()(
	forwardRef<Form, Prop>((props, ref) => {
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 18 }
		};
		const { Item } = Form;
		const { data, historyUnitNames, context } = props;
		const { getFieldDecorator } = props.form;
		const [parseAppList, setParseAppList] = useState<CParseApp[]>([]);
		const [cloudAppList, setCloudAppList] = useState<CParseApp[]>([]);
		const [parseAppSelectModalVisible, setParseAppSelectModalVisible] = useState<boolean>(
			false
		); //解析App选择框
		const [cloudAppSelectModalVisible, setCloudParseAppSelectModalVisible] = useState<boolean>(
			false
		); //云取证App选择框

		useEffect(() => {
			if (parseAppList.length === 0) {
				//首次加载时，将数据库中案件的解析应用列表数据赋值给parseAppList
				setParseAppList(data.m_Applist ? data.m_Applist : []);
			}
			context.parseAppSelectHandle(data.m_Applist ? data.m_Applist : []);
		}, [data.m_Applist]);
		useEffect(() => {
			if (cloudAppList.length === 0) {
				//首次加载时，将数据库中案件的云取证应用列表数据赋值给cloudAppList
				setCloudAppList(data.cloudAppList ? data.cloudAppList : []);
			}
			context.cloudAppSelectHandle(data.cloudAppList ? data.cloudAppList : []);
		}, [data.cloudAppList]);

		return (
			<>
				<Form {...formItemLayout}>
					<Row>
						<Col span={24}>
							<Item label="案件名称">
								{getFieldDecorator('currentCaseName', {
									rules: [{ required: true, message: '请填写案件名称' }],
									initialValue: getCaseName(data.m_strCaseName)
								})(
									<Input
										prefix={<Icon type="profile" />}
										maxLength={100}
										disabled={true}
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
										onClick={() => setCloudParseAppSelectModalVisible(true)}>
										{`云取证App（${cloudAppList.length}）`}
									</Button>
								</Group>
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item label="拉取SD卡">
								<Row>
									<Col span={2}>
										<Checkbox
											onChange={context.sdCardChange}
											checked={data.sdCard}
										/>
									</Col>
									<Col span={4}>
										<span>生成报告：</span>
										<Checkbox
											onChange={context.hasReportChange}
											checked={data.hasReport}
										/>
									</Col>
									<Col span={4}>
										<span>自动解析：</span>
										<Tooltip title="勾选后, 取证完成将自动解析应用数据">
											<Checkbox
												onChange={context.autoParseChange}
												checked={data.m_bIsAutoParse}
											/>
										</Tooltip>
									</Col>
									{config.useMode === UseMode.Army ? (
										<Col span={8} />
									) : (
										<>
											<Col span={4}>
												<span>自动生成BCP：</span>
												<Checkbox
													onChange={context.generateBcpChange}
													checked={data.generateBcp}
													disabled={!data.m_bIsAutoParse}
												/>
											</Col>
											<Col span={4}>
												<span>BCP包含附件：</span>
												<Checkbox
													onChange={context.attachmentChange}
													checked={data.attachment}
													disabled={
														!data.m_bIsAutoParse || !data.generateBcp
													}
												/>
											</Col>
										</>
									)}
									<Col span={4}>
										<span>删除原数据：</span>
										<Tooltip title="勾选后, 解析完成将删除原始数据">
											<Checkbox
												onChange={context.isDelChange}
												checked={data.isDel}
											/>
										</Tooltip>
									</Col>
									<Col span={2} />
								</Row>
							</Item>
						</Col>
					</Row>
					<div
						className="bcp-list"
						style={{ display: data.generateBcp ? 'block' : 'none' }}>
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
												required: data.generateBcp,
												message: '请选择采集人员'
											}
										],
										initialValue: context.getOfficerInitVal(data.officerNo)
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
										initialValue: data.securityCaseType
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
							<Col span={12}>
								<Item
									label="执法办案系统案件名称"
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleCaseName', {
										initialValue: data.handleCaseName
									})(<Input />)}
								</Item>
							</Col>
							<Col span={12}>
								<Item
									label="执法办案人员编号"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleOfficerNo', {
										initialValue: data.handleOfficerNo
									})(<Input />)}
								</Item>
							</Col>
						</Row>
					</div>
				</Form>
				{/* 解析App选择框 */}
				<AppSelectModal
					visible={parseAppSelectModalVisible}
					treeData={app.fetch}
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
					title="选择解析App">
					<fieldset>
						<legend>解析APP</legend>
						<ul>
							<li>不勾选APP默认拉取所有应用</li>
						</ul>
					</fieldset>
				</AppSelectModal>
				{/* 云取证App选择框 */}
				<AppSelectModal
					visible={cloudAppSelectModalVisible}
					treeData={cloud.fetch}
					selectedKeys={cloudAppList.map((i) => i.m_strID)}
					okHandle={(data) => {
						const selectApps = filterToParseApp(data);
						setCloudAppList(selectApps);
						context.cloudAppSelectHandle(selectApps);
						setCloudParseAppSelectModalVisible(false);
					}}
					closeHandle={() => {
						setCloudAppList(data.cloudAppList ?? []);
						setCloudParseAppSelectModalVisible(false);
					}}
					title="选择云取证App">
					<fieldset>
						<legend>云取APP（目前只支持android设备）</legend>
						<ul>
							<li>云取证APP必须包含在解析APP列表中</li>
							<li>
								微信——先要先在手机端打开微信, 并且进入账单（此过程手机会联网）,
								在手机上看到账单正常加载之后, 再进行取证
							</li>
							<li>其他APP没有特殊说明的按正常取证流程, 取证后会自动进行云取</li>
						</ul>
					</fieldset>
				</AppSelectModal>
			</>
		);
	})
);

export default EditForm;
