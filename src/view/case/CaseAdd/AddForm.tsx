import React, { MouseEvent, memo, useRef, useState, forwardRef, useCallback } from 'react';
import { remote, OpenDialogReturnValue } from 'electron';
import throttle from 'lodash/throttle';
import AutoComplete from 'antd/lib/auto-complete';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Form, { FormComponentProps } from 'antd/lib/form';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Select from 'antd/lib/select';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import AppSelectModal from '@src/components/AppSelectModal/AppSelectModal';
import { useMount } from '@src/hooks';
import { helper } from '@src/utils/helper';
import { UnderLine } from '@src/utils/regex';
import { UseMode } from '@src/schema/UseMode';
import { caseType } from '@src/schema/CaseType';
import CCaseInfo from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';
import { CParseApp } from '@src/schema/CParseApp';
import { DbInstance } from '@src/type/model';
import parseApp from '@src/config/parse-app.yaml';
import tokenApp from '@src/config/token-app.yaml';
import { Context, State } from './componentType';
import { filterToParseApp } from '../helper';

const getDb = remote.getGlobal('getDb');
const config = helper.readConf();
const { Group } = Button;
const { Item } = Form;

interface Prop extends FormComponentProps {
	/**
	 * 父组件CassAdd参数
	 */
	parameter: State;
	/**
	 * 上下文
	 */
	context: Context;
}

const AddForm = Form.create<Prop>()(
	forwardRef<Form, Prop>((props: Prop) => {
		const { getFieldDecorator } = props.form;
		const { context } = props;
		const {
			historyUnitNames,
			sdCard,
			hasReport,
			autoParse,
			generateBcp,
			disableGenerateBcp,
			attachment,
			disableAttachment,
			isDel
		} = props.parameter;
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 18 }
		};

		const allCaseData = useRef<CCaseInfo[]>([]);
		const [parseAppList, setParseAppList] = useState<CParseApp[]>([]);
		const [cloudAppList, setCloudAppList] = useState<CParseApp[]>([]);
		const [parseAppSelectModalVisible, setParseAppSelectModalVisible] = useState<boolean>(
			false
		); //解析App选择框
		const [cloudAppSelectModalVisible, setCloudParseAppSelectModalVisible] = useState<boolean>(
			false
		); //云取证App选择框

		useMount(async () => {
			const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
			try {
				allCaseData.current = await db.find(null);
			} catch (error) {
				allCaseData.current = [];
			}
		});

		/**
		 * 选择案件路径Handle
		 */
		const selectDirHandle = useCallback((event: MouseEvent<HTMLInputElement>) => {
			const { setFieldsValue } = props.form;
			remote.dialog
				.showOpenDialog({
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
		const validCaseNameExists = useCallback(
			throttle((rule: any, value: string, callback: any) => {
				const { current } = allCaseData;
				const exists = current.find((i) => {
					let [caseName, timestamp] = i.m_strCaseName.split('_');
					return caseName === value;
				});
				if (exists) {
					callback(new Error('案件名称已存在'));
				} else {
					callback();
				}
			}, 400),
			[]
		);

		/**
		 * 将JSON数据转为Options元素
		 * @param data JSON数据
		 */
		const getOptions = useCallback((data: Record<string, string>[]): JSX.Element[] => {
			const { Option } = Select;
			return data.map((item) => (
				<Option value={item.value} key={item.value}>
					{item.name}
				</Option>
			));
		}, []);

		return (
			<>
				<Form {...formItemLayout}>
					<Row>
						<Col span={24}>
							<Item label="案件名称">
								{getFieldDecorator('currentCaseName', {
									rules: [
										{ required: true, message: '请填写案件名称' },
										{ pattern: UnderLine, message: '不允许输入下划线' },
										{
											validator: validCaseNameExists,
											message: '案件名称已存在'
										}
									]
								})(<Input maxLength={30} />)}
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
										onClick={() => setCloudParseAppSelectModalVisible(true)}
										icon="cloud-sync">
										{`Token云取证App（${cloudAppList.length}）`}
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
											checked={sdCard}
										/>
									</Col>
									<Col span={4}>
										<span>生成报告：</span>
										<Checkbox
											onChange={context.hasReportChange}
											checked={hasReport}
										/>
									</Col>
									<Col span={4}>
										<span>自动解析：</span>
										<Tooltip title="勾选后, 取证完成将自动解析应用数据">
											<Checkbox
												onChange={context.autoParseChange}
												checked={autoParse}
											/>
										</Tooltip>
									</Col>
									{config.useMode === UseMode.Army ? (
										<>
											<Col span={4}>
												<span>删除原数据：</span>
												<Tooltip title="勾选后, 解析完成将删除原始数据">
													<Checkbox
														onChange={context.isDelChange}
														checked={isDel}
													/>
												</Tooltip>
											</Col>
											<Col span={10} />
										</>
									) : (
										<>
											<Col span={4}>
												<span>自动生成BCP：</span>
												<Checkbox
													onChange={context.generateBcpChange}
													checked={generateBcp}
													disabled={disableGenerateBcp}
												/>
											</Col>
											<Col span={4}>
												<span>BCP包含附件：</span>
												<Checkbox
													onChange={context.attachmentChange}
													checked={attachment}
													disabled={disableAttachment}
												/>
											</Col>
											<Col span={4}>
												<span>删除原数据：</span>
												<Tooltip title="勾选后, 解析完成将删除原始数据">
													<Checkbox
														onChange={context.isDelChange}
														checked={isDel}
													/>
												</Tooltip>
											</Col>
										</>
									)}
								</Row>
							</Item>
						</Col>
					</Row>
					<div className="bcp-list" style={{ display: generateBcp ? 'block' : 'none' }}>
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
										initialValue: '0100'
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
							<Col span={12}>
								<Item
									label="执法办案系统案件名称"
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleCaseName')(<Input />)}
								</Item>
							</Col>
							<Col span={12}>
								<Item
									label="执法办案人员编号"
									labelCol={{ span: 6 }}
									wrapperCol={{ span: 14 }}>
									{getFieldDecorator('handleOfficerNo')(<Input />)}
								</Item>
							</Col>
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
					visible={cloudAppSelectModalVisible}
					treeData={tokenApp.fetch}
					selectedKeys={cloudAppList.map((i) => i.m_strID)}
					okHandle={(data) => {
						const selectApps = filterToParseApp(data);
						setCloudAppList(selectApps);
						context.cloudAppSelectHandle(selectApps);
						setCloudParseAppSelectModalVisible(false);
					}}
					closeHandle={() => {
						setCloudAppList([]);
						setCloudParseAppSelectModalVisible(false);
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

export default memo(AddForm);
