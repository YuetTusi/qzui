import { remote, OpenDialogReturnValue } from 'electron';
import React, { forwardRef, useState } from 'react';
import moment, { Moment } from 'moment';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Radio from 'antd/lib/radio';
import Select from 'antd/lib/select';
import Icon from 'antd/lib/icon';
import DatePicker from 'antd/lib/date-picker';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import Empty from 'antd/lib/empty';
import locale from 'antd/es/date-picker/locale/zh_CN';
import { certificateType } from '@src/schema/CertificateType';
import { caseType } from '@src/schema/CaseType';
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';
import { helper } from '@utils/helper';
import { No } from '@utils/regex';
import { GeneratorFormProp } from './componentType';

const { Item } = Form;
const { Group } = Radio;
const { Option } = Select;

/**
 * 将JSON数据转为Options元素
 * @param data JSON数据
 */
const getOptions = (data: Record<string, any>): JSX.Element[] =>
	data.map((item: Record<string, any>) => (
		<Option value={item.value} key={item.value}>
			{item.name}
		</Option>
	));

/**
 * 选择头像
 */
const selectDirHandle = debounce(
	(setFieldsValue: (obj: Object, callback?: Function | undefined) => void) => {
		remote.dialog
			.showOpenDialog({
				properties: ['openFile'],
				filters: [{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }]
			})
			.then((val: OpenDialogReturnValue) => {
				if (val.filePaths && val.filePaths.length > 0) {
					setFieldsValue({ credentialAvatar: val.filePaths[0] });
				}
			});
	},
	600,
	{ leading: true, trailing: false }
);

/**
 * BCP表单组件
 */
const GeneratorForm = Form.create<GeneratorFormProp>({ name: 'bcpForm' })(
	forwardRef<Form, GeneratorFormProp>((props, ref) => {
		const { caseData, deviceData, bcpHistory, currentUnitNo, currentDstUnitNo } = props;
		const { getFieldDecorator, setFieldsValue, resetFields } = props.form;
		const formItemLayout = {
			labelCol: { span: 8 },
			wrapperCol: { span: 14 }
		};
		const [bcpRequired, setBcpRequired] = useState<boolean>(false);

		const getBcpNo1 = () => {
			if (currentUnitNo) {
				let unitNo = currentUnitNo.substring(0, 6); //取采集单位的前6位
				let timestamp = moment().format('YYYYMM');
				return unitNo + timestamp;
			} else {
				return '';
			}
		};

		return (
			<div className="sort">
				<Form layout="horizontal" {...formItemLayout} ref={ref}>
					<Row>
						<Col span={12}>
							<Item label="BCP附件">
								{getFieldDecorator('attachment', {
									rules: [
										{
											required: true,
											message: '请确定有无附件'
										}
									],
									initialValue: caseData?.attachment
								})(
									<Group>
										<Radio value={false}>无附件</Radio>
										<Radio value={true}>有附件</Radio>
									</Group>
								)}
							</Item>
						</Col>
						<Col span={12} />
					</Row>
					<hr />
					<Row>
						<Col span={12}>
							<Item label="采集单位">
								{getFieldDecorator('unit', {
									rules: [
										{
											required: true,
											message: '请选择采集单位'
										}
									],
									initialValue: currentUnitNo
								})(
									<Select
										showSearch={true}
										placeholder={'输入单位名称进行查询'}
										defaultActiveFirstOption={false}
										notFoundContent={
											<Empty
												description="暂无数据"
												image={Empty.PRESENTED_IMAGE_SIMPLE}
											/>
										}
										showArrow={false}
										filterOption={false}
										onSearch={props.selectSearchHandle}
										onChange={(value: string, options: Record<string, any>) => {
											let unitNo = value.substring(0, 6);
											setFieldsValue({
												bcpNo1: unitNo + moment().format('YYYYMM')
											});
											props.unitChangeHandle(value, options);
										}}
										style={{ width: '100%' }}>
										{props.unitList}
									</Select>
								)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="目的检验单位">
								{getFieldDecorator('dstUnit', {
									rules: [
										{
											required: true,
											message: '请选择目的检验单位'
										}
									],
									initialValue: currentDstUnitNo
								})(
									<Select
										showSearch={true}
										placeholder={'输入单位名称进行查询'}
										defaultActiveFirstOption={false}
										notFoundContent={
											<Empty
												description="暂无数据"
												image={Empty.PRESENTED_IMAGE_SIMPLE}
											/>
										}
										showArrow={false}
										filterOption={false}
										onSearch={props.selectSearchHandle}
										onChange={props.dstUnitChangeHandle}
										style={{ width: '100%' }}>
										{props.dstUnitList}
									</Select>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="采集人员">
								{getFieldDecorator('officer', {
									rules: [
										{
											required: true,
											message: '请选择采集人员'
										}
									],
									initialValue: caseData?.officerNo
								})(
									<Select
										onChange={props.officerChangeHandle}
										notFoundContent="暂无数据">
										{props.officerList}
									</Select>
								)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="手机持有人">
								{getFieldDecorator('mobileHolder', {
									rules: [
										{
											required: true,
											message: '请填写持有人'
										}
									],
									initialValue: deviceData?.mobileHolder
								})(<Input />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="检材编号(编码+日期)">
								{getFieldDecorator('bcpNo1', {
									rules: [
										{
											required: bcpRequired,
											message: '请填写检材编号'
										},
										{
											pattern: No,
											message: '请输入数字'
										}
									],
									initialValue: getBcpNo1()
								})(<Input maxLength={12} placeholder="12位数字" />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="校验检材编号">
								<Switch
									checked={bcpRequired}
									onChange={(checked: boolean) => {
										resetFields(['bcpNo1', 'bcpNo2', 'bcpNo3']);
										setBcpRequired(checked);
									}}
								/>
								<em className={classnames({ active: bcpRequired })}>
									开启将强制输入检材编号且验证格式
								</em>
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="检材编号(前3位)">
								{getFieldDecorator('bcpNo2', {
									rules: [
										{
											required: bcpRequired,
											message: '请填写检材编号'
										},
										{
											pattern: No,
											message: '请输入数字'
										}
									],
									initialValue: ''
								})(<Input maxLength={3} placeholder="3位数字" />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="检材编号(后4位)">
								{getFieldDecorator('bcpNo3', {
									rules: [
										{
											required: bcpRequired,
											message: '请填写检材编号'
										},
										{
											pattern: No,
											message: '请输入数字'
										}
									],
									initialValue: ''
								})(<Input maxLength={4} placeholder="4位数字" />)}
							</Item>
						</Col>
					</Row>
					<hr />
					<Row>
						<Col span={12}>
							<Item label="手机号">
								{getFieldDecorator('phoneNumber', {
									initialValue: bcpHistory?.phoneNumber ?? ''
								})(<Input />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="检材持有人编号">
								{getFieldDecorator('handleOfficerNo', {
									initialValue:
										bcpHistory?.handleOfficerNo ?? deviceData?.handleOfficerNo
								})(<Input placeholder="检材持有人编号/执法办案人员编号" />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="证件类型">
								{getFieldDecorator('credentialType', {
									initialValue: bcpHistory?.credentialType ?? '111'
								})(
									<Select notFoundContent="暂无数据">
										{getOptions(certificateType)}
									</Select>
								)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="证件编号">
								{getFieldDecorator('credentialNo', {
									initialValue: bcpHistory?.credentialNo ?? ''
								})(<Input />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="证件生效日期">
								{getFieldDecorator('credentialEffectiveDate', {
									initialValue: helper.isNullOrUndefinedOrEmptyString(
										bcpHistory?.credentialEffectiveDate
									)
										? undefined
										: moment(bcpHistory?.credentialEffectiveDate, 'YYYY-MM-DD')
								})(<DatePicker locale={locale} style={{ width: '100%' }} />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="证件失效日期">
								{getFieldDecorator('credentialExpireDate', {
									initialValue: helper.isNullOrUndefinedOrEmptyString(
										bcpHistory?.credentialExpireDate
									)
										? undefined
										: moment(bcpHistory?.credentialExpireDate, 'YYYY-MM-DD')
								})(<DatePicker locale={locale} style={{ width: '100%' }} />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="证件签发机关">
								{getFieldDecorator('credentialOrg', {
									initialValue: bcpHistory?.credentialOrg ?? ''
								})(<Input />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="证件认证头像">
								{getFieldDecorator('credentialAvatar', {
									initialValue: bcpHistory?.credentialAvatar ?? ''
								})(
									<Input
										addonAfter={
											<Icon
												type="ellipsis"
												onClick={() => selectDirHandle(setFieldsValue)}
											/>
										}
										readOnly={true}
										onClick={() => selectDirHandle(setFieldsValue)}
									/>
								)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="性别">
								{getFieldDecorator('gender', {
									initialValue: bcpHistory?.gender ?? '1'
								})(<Select>{getOptions(sexCode)}</Select>)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="民族">
								{getFieldDecorator('nation', {
									initialValue: bcpHistory?.nation ?? '01'
								})(<Select>{getOptions(ethnicity)}</Select>)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="出生日期">
								{getFieldDecorator('birthday', {
									initialValue: helper.isNullOrUndefinedOrEmptyString(
										bcpHistory?.birthday
									)
										? undefined
										: moment(bcpHistory?.birthday, 'YYYY-MM-DD')
								})(
									<DatePicker
										disabledDate={(current: Moment | null) => {
											if (current) {
												return current > moment().endOf('day');
											} else {
												return false;
											}
										}}
										locale={locale}
										style={{ width: '100%' }}
									/>
								)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="住址">
								{getFieldDecorator('address', {
									initialValue: bcpHistory?.address ?? ''
								})(<Input />)}
							</Item>
						</Col>
					</Row>
					<hr />
					<Row>
						<Col span={12}>
							<Item label="网安部门案件编号">
								{getFieldDecorator('securityCaseNo', {
									initialValue: caseData?.securityCaseNo
								})(<Input />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="网安部门案件类别">
								{getFieldDecorator('securityCaseType', {
									initialValue: caseData?.securityCaseType ?? ''
								})(<Select>{getOptions(caseType)}</Select>)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item
								label="网安部门案件名称"
								labelCol={{ span: 4 }}
								wrapperCol={{ span: 19 }}>
								{getFieldDecorator('securityCaseName', {
									initialValue: caseData?.securityCaseName
								})(<Input />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<Item label="执法办案系统案件编号">
								{getFieldDecorator('handleCaseNo', {
									initialValue: caseData?.handleCaseNo
								})(<Input />)}
							</Item>
						</Col>
						<Col span={12}>
							<Item label="执法办案系统案件类别">
								{getFieldDecorator('handleCaseType', {
									initialValue: caseData?.handleCaseType
								})(<Input />)}
							</Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Item
								label="执法办案系统案件名称"
								labelCol={{ span: 4 }}
								wrapperCol={{ span: 19 }}>
								{getFieldDecorator('handleCaseName', {
									initialValue: caseData?.handleCaseName
								})(<Input />)}
							</Item>
						</Col>
					</Row>
				</Form>
			</div>
		);
	})
);

export default GeneratorForm;
