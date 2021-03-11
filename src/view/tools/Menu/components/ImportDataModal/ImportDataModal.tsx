import path from 'path';
import { remote } from 'electron';
import React, { FC, MouseEvent, useRef } from 'react';
import { connect } from 'dva';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { helper } from '@utils/helper';
import { withModeButton } from '@src/components/enhance';
import { useMount } from '@src/hooks';
import { DbInstance, StateTree } from '@src/type/model';
import { FetchData } from '@src/schema/socket/FetchData';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { FetchState, ParseState } from '@src/schema/socket/DeviceState';
import { TableName } from '@src/schema/db/TableName';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { DataMode } from '@src/schema/DataMode';
import ImportForm from './ImportForm';
import { FormValue } from './FormValue';
import { Prop } from './ComponentTypes';
import PhoneSystem from '@src/schema/socket/PhoneSystem';

const getDb = remote.getGlobal('getDb');
const ModeButton = withModeButton()(Button);

/**
 * 导入第三方数据弹框
 */
const ImportDataModal: FC<Prop> = (props) => {
	const formRef = useRef<any>(null);

	useMount(() => {
		const { dispatch } = props;
		dispatch!({ type: 'importDataModal/queryCaseList' });
	});

	/**
	 * 将手机入库并通知Parse开始导入
	 * @param fetchData 导入的数据
	 * @param packagePath 第三方数据路径
	 * @param dataType 数据类型
	 */
	const saveDeviceToCase = async (
		fetchData: FetchData,
		packagePath: string,
		dataType: string
	) => {
		const { dispatch } = props;
		const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
		try {
			let caseData = await db.findOne({ _id: fetchData.caseId });

			if (caseData === null) {
				message.destroy();
				message.error('查无此案件，请重新选择');
			} else {
				let rec = new DeviceType();
				rec.id = helper.newId();
				rec.mobileHolder = fetchData.mobileHolder;
				rec.mobileNo = fetchData.mobileNo;
				rec.mobileName = `${fetchData.mobileName}_${helper.timestamp()}`;
				rec.note = fetchData.note;
				rec.fetchTime = new Date();
				rec.phonePath = path.join(
					caseData.m_strCasePath,
					caseData.m_strCaseName!,
					fetchData.mobileHolder!,
					rec.mobileName
				);
				rec.fetchState = FetchState.Finished;
				rec.mode = DataMode.Self;
				rec.caseId = fetchData.caseId; //所属案件id
				rec.parseState = ParseState.Parsing;
				rec.system = dataType === 'ios' ? PhoneSystem.IOS : PhoneSystem.Android;
				//NOTE:将设备数据入库并通知Parse开始导入
				dispatch({
					type: 'importDataModal/saveImportDeviceToCase',
					payload: { device: rec, packagePath, dataType }
				});
				props.cancelHandle!();
				message.info('正在导入...请在「数据解析」页查看解析进度');
			}
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * 表单提交
	 */
	const formSubmit = (e: MouseEvent<HTMLElement>) => {
		e.preventDefault();

		const { validateFields } = formRef.current;
		validateFields((errors: any, values: FormValue) => {
			if (!errors) {
				saveDeviceToCase(values, values.packagePath, values.dataType);
			}
		});
	};

	/**
	 * 渲染表单
	 */
	const renderForm = (): JSX.Element => {
		const { caseList } = props.importDataModal!;

		return <ImportForm ref={formRef} caseList={caseList} />;
	};

	return (
		<Modal
			visible={props.visible}
			onCancel={() => {
				props.cancelHandle!();
			}}
			afterClose={() => {}}
			footer={[
				<ModeButton
					type="default"
					icon="close-circle"
					onClick={() => props.cancelHandle!()}>
					取消
				</ModeButton>,
				<ModeButton type="primary" icon="import" onClick={formSubmit}>
					导入
				</ModeButton>
			]}
			title="导入信息录入"
			width={800}
			destroyOnClose={true}
			maskClosable={false}>
			<div className="case-input-modal">{renderForm()}</div>
		</Modal>
	);
};

export default connect((state: StateTree) => {
	return {
		importDataModal: state.importDataModal
	};
})(ImportDataModal);
