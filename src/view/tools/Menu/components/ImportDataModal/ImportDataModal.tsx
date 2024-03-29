import { join } from 'path';
import { ipcRenderer } from 'electron';
import React, { FC, MouseEvent, useRef } from 'react';
import debounce from 'lodash/debounce';
import { connect } from 'dva';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { helper } from '@utils/helper';
import { useMount } from '@src/hooks';
import { withModeButton } from '@src/components/enhance';
import { StateTree } from '@src/type/model';
import { FetchData } from '@src/schema/socket/FetchData';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { FetchState, ParseState } from '@src/schema/socket/DeviceState';
import { TableName } from '@src/schema/db/TableName';
import { DataMode } from '@src/schema/DataMode';
import PhoneSystem from '@src/schema/socket/PhoneSystem';
import { ImportTypes } from '@src/schema/ImportType';
import ImportForm from './ImportForm';
import { FormValue } from './FormValue';
import { Prop } from './ComponentTypes';
import './ImportDataModal.less';

const { caseText, parseText } = helper.readConf();
const ModeButton = withModeButton()(Button);

/**
 * 导入第三方数据弹框
 */
const ImportDataModal: FC<Prop> = ({
	dispatch, visible, type, importDataModal, cancelHandle
}) => {

	const formRef = useRef<any>(null);
	useMount(() => dispatch({ type: 'importDataModal/queryCaseList' }));

	/**
	 * 将手机入库并通知Parse开始导入
	 * @param fetchData 导入的数据
	 * @param packagePath 第三方数据路径
	 * @param sdCardPath SD卡路径（只有安卓数据使用此参数）
	 */
	const saveDeviceToCase = debounce(
		async (fetchData: FetchData, packagePath: string, sdCardPath?: string) => {
			try {
				let caseData = await ipcRenderer.invoke('db-find-one', TableName.Case, {
					_id: fetchData.caseId
				});

				if (caseData === null) {
					message.destroy();
					message.error(`查无此${caseText ?? '案件'}，请重新选择`);
				} else {
					let rec = new DeviceType();
					rec.id = helper.newId();
					rec.mobileHolder = fetchData.mobileHolder;
					rec.mobileNo = fetchData.mobileNo;
					rec.mobileName = `${fetchData.mobileName}_${helper.timestamp()}`;
					rec.note = fetchData.note;
					rec.fetchTime = new Date();
					rec.phonePath = join(
						caseData.m_strCasePath,
						caseData.m_strCaseName!,
						fetchData.mobileHolder!,
						rec.mobileName
					);
					rec.fetchState = FetchState.Finished;
					rec.mode = DataMode.Self;
					rec.caseId = fetchData.caseId; //所属案件id
					rec.parseState = ParseState.Parsing;
					switch (type) {
						case ImportTypes.IOS:
						case ImportTypes.IOSMirror:
							rec.system = PhoneSystem.IOS;
							break;
						case ImportTypes.SamsungSmartswitch:
							packagePath = join(packagePath, '../'); //三星选到xml文件，要退回一级目录
							rec.system = PhoneSystem.Android;
							break;
						default:
							rec.system = PhoneSystem.Android;
							break;
					}

					//NOTE:将设备数据入库并通知Parse开始导入
					dispatch({
						type: 'importDataModal/saveImportDeviceToCase',
						payload: {
							device: rec,
							packagePath,
							sdCardPath,
							dataType: type
						}
					});
					cancelHandle!();
					message.info(`正在导入...请在「数据${parseText ?? '解析'}」页查看解析进度`);
				}
			} catch (error) {
				console.log(error);
			}
		},
		400,
		{ leading: true, trailing: false }
	);

	/**
	 * 表单提交
	 */
	const formSubmit = (e: MouseEvent<HTMLElement>) => {
		e.preventDefault();

		const { validateFields } = formRef.current;
		validateFields((errors: any, values: FormValue) => {
			if (!errors) {
				saveDeviceToCase(values, values.packagePath, values.sdCardPath);
			}
		});
	};

	/**
	 * 渲染表单
	 */
	const renderForm = (): JSX.Element => {
		const { caseList } = importDataModal!;

		return <ImportForm ref={formRef} type={type} caseList={caseList} />;
	};

	const renderTips = () => {
		const { tips } = importDataModal!;
		if (tips.length > 0) {
			return <fieldset className="tip-msg full">
				<legend>提示</legend>
				<ul>
					{importDataModal?.tips.map((item, index) => <li key={`IDMT_${index}`}>{item}</li>)}
				</ul>
			</fieldset>;
		} else {
			return null;
		}
	};

	return (
		<Modal
			visible={visible}
			onCancel={() => {
				cancelHandle!();
			}}
			afterClose={() => { }}
			footer={[
				<ModeButton type="default" icon="close-circle" onClick={() => cancelHandle!()}>
					取消
				</ModeButton>,
				<ModeButton type="primary" icon="import" onClick={formSubmit}>
					导入
				</ModeButton>
			]}
			title="导入信息录入"
			width={800}
			centered={true}
			destroyOnClose={true}
			maskClosable={false}
			className="import-data-modal-root">
			{renderTips()}
			<div className="case-input-modal">{renderForm()}</div>
		</Modal>
	);
};

export default connect((state: StateTree) => {
	return {
		importDataModal: state.importDataModal
	};
})(ImportDataModal);
