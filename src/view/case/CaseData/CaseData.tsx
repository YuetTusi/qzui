import path from 'path';
import { ipcRenderer } from 'electron';
import { OpenDialogReturnValue } from 'electron';
import React, { Component, FormEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Table from 'antd/lib/table';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@utils/helper';
import { withModeButton } from '@src/components/enhance';
import InnerPhoneTable from './components/InnerPhoneTable';
import ScanModal from './components/ScanModal';
import CreateCheckModal from './components/CreateCheckModal';
import { getCaseByName, importDevice, readCaseJson, readDirOnly } from './helper';
import { getColumns } from './columns';
import { Prop, State } from './componentType';
import './CaseData.less';

const ModeButton = withModeButton()(Button);
const { useQuickFetch, caseText } = helper.readConf();

/**
 * 案件信息维护
 * 对应模型：model/settings/Case
 */
const WrappedCase = Form.create<Prop>({ name: 'search' })(
	class CaseData extends Component<Prop, State> {

		constructor(props: Prop) {
			super(props);
			this.state = {
				isAdmin: false,
				expendRowKeys: [],
				createCheckModalVisible: false,
				checkCaseId: undefined,
				ip: ''
			};
		}
		componentDidMount() {
			const [, roleName] = this.props.location.search.split('=');
			if (roleName === 'admin') {
				this.setState({ isAdmin: true });
			}
			setTimeout(() => {
				this.props.dispatch({ type: 'caseData/fetchCaseData', payload: { current: 1 } });
			});
		}
		/**
		 * 查询
		 */
		searchSubmit = (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			this.props.dispatch({ type: 'caseData/fetchCaseData', payload: { current: 1 } });
		};
		/**
		 * 翻页Change
		 */
		pageChange = (current: number, pageSize?: number) => {
			this.props.dispatch({
				type: 'caseData/fetchCaseData',
				payload: {
					current,
					pageSize
				}
			});
		};
		/**
		 * 案件/检材选择
		 * @param {boolean} isCase 是否是案件
		 */
		selectCaseOrDeviceHandle = debounce(
			async (isCase: boolean) => {
				const dialogVal: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
					title: isCase ? '请选择 Case.json 文件' : '请选择 Device.json 文件',
					properties: ['openFile'],
					filters: [
						{ name: isCase ? 'Case.json文件' : 'Device.json文件', extensions: ['json'] }
					]
				});

				if (dialogVal.filePaths.length > 0) {
					isCase
						? this.startImportCase(dialogVal.filePaths[0])
						: this.startImportDevice(dialogVal.filePaths[0]);
				}
			},
			400,
			{ leading: true, trailing: false }
		);

		/**
		 * 验证用户所选目录中是否存在Device.json&Case.json
		 * @param devicePath 检材目录
		 * @returns {Promise<boolean>} true为验证通过
		 */
		validJsonInDir = async (devicePath: string) => {
			const deviceJsonPath = path.join(devicePath, './Device.json');
			const caseJsonPath = path.join(devicePath, '../../Case.json');
			const [deviceJsonExist, caseJsonExist] = await Promise.all([
				helper.existFile(deviceJsonPath),
				helper.existFile(caseJsonPath)
			]);
			if (!deviceJsonExist || !caseJsonExist) {
				Modal.error({
					title: '导入失败',
					content: '数据文件缺失',
					okText: '确定'
				});
				return false;
			}
			return true;
		};

		/**
		 * 导入案件
		 * @param caseJsonPath 案件Case.json路径
		 */
		startImportCase = async (caseJsonPath: string) => {
			const modal = Modal.info({
				content: `正在导入${caseText ?? '案件'}及检材，请稍后...`,
				okText: '确定',
				maskClosable: false,
				okButtonProps: { disabled: true, icon: 'loading' }
			});

			try {
				const caseJson = await readCaseJson(caseJsonPath);
				if (helper.isNullOrUndefinedOrEmptyString(caseJson.caseName)) {
					throw new Error(`无法读取${caseText ?? '案件'}数据，请选择Case.json文件`);
				}
				const casePath = path.join(caseJsonPath, '../../');
				const caseSavePath = path.join(caseJsonPath, '../');
				const caseData = await getCaseByName(caseJson, casePath);
				const holderDir = await readDirOnly(caseSavePath);
				const holderFullDir = holderDir.map((i) => path.join(caseSavePath, i));

				let allDeviceJsonPath: string[] = [];
				for (let i = 0; i < holderFullDir.length; i++) {
					const devicePath = await readDirOnly(holderFullDir[i]);

					for (let j = 0; j < devicePath.length; j++) {
						allDeviceJsonPath = allDeviceJsonPath.concat([
							path.join(holderFullDir[i], devicePath[j], 'Device.json')
						]);
					}
				}
				const importTasks = allDeviceJsonPath.map((i) => importDevice(i, caseData));
				await Promise.allSettled(importTasks);

				modal.update({
					content: `${caseText ?? '案件'}导入成功`,
					okButtonProps: { disabled: false, icon: 'check-circle' }
				});
			} catch (error) {
				modal.update({
					title: `${caseText ?? '案件'}导入失败`,
					content: error.message,
					okButtonProps: { disabled: false, icon: 'check-circle' }
				});
			} finally {
				this.props.dispatch({ type: 'caseData/fetchCaseData', payload: { current: 1 } });
				setTimeout(() => {
					modal.destroy();
				}, 3000);
			}
		};
		/**
		 * 导入检材（设备）
		 * @param deviceJsonPath 设备Device.json路径
		 */
		startImportDevice = async (deviceJsonPath: string) => {
			const modal = Modal.info({
				content: '正在导入检材，请稍后...',
				okText: '确定',
				maskClosable: false,
				okButtonProps: { disabled: true, icon: 'loading' }
			});
			const caseJsonPath = path.join(deviceJsonPath, '../../../Case.json');
			const casePath = path.join(deviceJsonPath, '../../../../');
			try {
				const caseJson = await readCaseJson(caseJsonPath);
				if (helper.isNullOrUndefinedOrEmptyString(caseJson.caseName)) {
					throw new Error(`导入检材失败，无法读取${caseText ?? '案件'}数据`);
				}
				const caseData = await getCaseByName(caseJson, casePath);
				await importDevice(deviceJsonPath, caseData);
				modal.update({
					content: '检材导入成功',
					okButtonProps: { disabled: false, icon: 'check-circle' }
				});
			} catch (error) {
				modal.update({
					title: '检材导入失败',
					content: error.message,
					okButtonProps: { disabled: false, icon: 'check-circle' }
				});
			} finally {
				this.props.dispatch({ type: 'caseData/fetchCaseData', payload: { current: 1 } });
				setTimeout(() => {
					modal.destroy();
				}, 3000);
			}
		};
		/**
		 * 快速点验
		 */
		openCheckQRCodeHandle = async (caseId?: string) => {
			this.setState({
				checkCaseId: caseId,
				createCheckModalVisible: true
			});
		}
		/**
		 * 保存快速点验案件
		 * @param data 案件数据
		 */
		onSaveCaseHandle = (data: CCaseInfo) => {
			const { dispatch } = this.props;
			if (this.state.checkCaseId === undefined) {
				//创建
				this.props.dispatch({ type: 'menu/saveCheckCase', payload: data });
			} else {
				//编辑
				dispatch({ type: 'caseEdit/saveCase', payload: data });
			}
			dispatch({ type: 'caseEdit/setData', payload: {} });
			this.setState({
				checkCaseId: undefined,
				createCheckModalVisible: false
			});
		};
		/**
		 * 渲染子表格
		 */
		renderSubTable = ({ _id }: CCaseInfo) => <InnerPhoneTable caseId={_id!} />;
		render(): JSX.Element {
			const {
				dispatch,
				caseData: { loading, caseData, total, current, pageSize, checkCaseId }
			} = this.props;
			return (
				<div className="case-panel">
					<div className="case-content">
						<Table<CCaseInfo>
							columns={getColumns(dispatch, this)}
							expandedRowRender={this.renderSubTable}
							dataSource={caseData}
							rowKey={(record: CCaseInfo) => record.m_strCaseName}
							expandRowByClick={true}
							expandedRowKeys={this.state.expendRowKeys}
							onExpandedRowsChange={(rowKeys: string[] | number[]) =>
								this.setState({ expendRowKeys: rowKeys })
							}
							pagination={{
								total,
								current,
								pageSize,
								onChange: this.pageChange
							}}
							locale={{ emptyText: <Empty description={`无${caseText ?? '案件'}数据`} /> }}
							loading={loading}
							bordered={true}
						/>
					</div>
					<div className="fix-buttons">
						<span>
							<ModeButton
								onClick={() => this.selectCaseOrDeviceHandle(true)}
								type="primary"
								icon="import">
								导入{caseText ?? '案件'}
							</ModeButton>
							<ModeButton
								onClick={() => this.selectCaseOrDeviceHandle(false)}
								style={{ display: this.state.isAdmin ? 'inline-block' : 'none' }}
								type="primary"
								icon="import">
								导入检材
							</ModeButton>
							{
								useQuickFetch
									? <ModeButton
										type="primary"
										icon="thunderbolt"
										onClick={() => this.openCheckQRCodeHandle(undefined)}>
										创建点验{caseText ?? '案件'}
									</ModeButton>
									: null
							}
							<ModeButton
								type="primary"
								icon="plus"
								onClick={() => dispatch(routerRedux.push('/case/case-add'))}>
								创建新{caseText ?? '案件'}
							</ModeButton>
						</span>
					</div>
					<ScanModal
						visible={checkCaseId !== null}
						caseId={checkCaseId!}
						ip={this.state.ip}
						cancelHandle={() => dispatch({ type: 'caseData/setCheckCaseId', payload: null })}
					/>
					<CreateCheckModal
						visible={this.state.createCheckModalVisible}
						caseId={this.state.checkCaseId}
						saveHandle={this.onSaveCaseHandle}
						cancelHandle={() => {
							dispatch({ type: 'caseEdit/setData', payload: {} });
							this.setState({
								checkCaseId: undefined,
								createCheckModalVisible: false
							});
						}}
					/>
				</div>
			);
		}
	}
);

export default connect((state: StateTree) => ({ caseData: state.caseData }))(WrappedCase);
