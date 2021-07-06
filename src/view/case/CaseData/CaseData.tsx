import path from 'path';
import { remote } from 'electron';
import React, { Component, FormEvent, MouseEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Table from 'antd/lib/table';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import { withModeButton } from '@src/components/enhance';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@utils/helper';
import { getColumns } from './columns';
import InnerPhoneTable from './components/InnerPhoneTable';
import { getCaseByName, importDevice, readCaseJson, readDirOnly } from './helper';
import { Prop, State } from './componentType';
import './CaseData.less';

const { dialog } = remote;
const ModeButton = withModeButton()(Button);

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
				expendRowKeys: []
			};
		}
		componentDidMount() {
			const [, roleName] = this.props.location.search.split('=');
			setTimeout(() => {
				this.props.dispatch({ type: 'caseData/fetchCaseData', payload: { current: 1 } });
			});
			if (roleName === 'admin') {
				this.setState({ isAdmin: true });
			}
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
		 * 案件选择
		 */
		selectCaseHandle = debounce(
			async (e: MouseEvent<HTMLButtonElement>) => {
				const dialogVal = await dialog.showOpenDialog({
					title: '请选择 Case.json 文件',
					properties: ['openFile'],
					filters: [{ name: 'Case.json文件', extensions: ['json'] }]
				});

				if (dialogVal.filePaths.length > 0) {
					this.startImportCase(dialogVal.filePaths[0]);
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
			const [deviceJsonExist, caseJdonExist] = await Promise.all([
				helper.existFile(deviceJsonPath),
				helper.existFile(caseJsonPath)
			]);
			if (!deviceJsonExist || !caseJdonExist) {
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
				content: '正在导入案件及检材，请稍后...',
				okText: '确定',
				maskClosable: false,
				okButtonProps: { disabled: true, icon: 'loading' }
			});

			try {
				const caseJson = await readCaseJson(caseJsonPath);
				if (helper.isNullOrUndefinedOrEmptyString(caseJson.caseName)) {
					throw new Error('无法读取案件数据，请选择Case.json文件');
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
					content: '案件导入成功',
					okButtonProps: { disabled: false, icon: 'check-circle' }
				});
			} catch (error) {
				modal.update({
					title: '案件导入失败',
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
		 * 渲染子表格
		 */
		renderSubTable = ({ _id }: CCaseInfo) => <InnerPhoneTable caseId={_id!} />;
		render(): JSX.Element {
			const {
				dispatch,
				caseData: { loading, caseData, total, current, pageSize }
			} = this.props;
			return (
				<div className="case-panel">
					<div className="case-content">
						<Table<CCaseInfo>
							columns={getColumns(dispatch)}
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
							locale={{ emptyText: <Empty description="无案件数据" /> }}
							loading={loading}
							bordered={true}
						/>
					</div>
					<div className="fix-buttons">
						<span>
							<ModeButton
								onClick={this.selectCaseHandle}
								type="primary"
								icon="import">
								导入案件
							</ModeButton>
						</span>
						<span>
							<ModeButton
								type="primary"
								icon="plus"
								onClick={() =>
									this.props.dispatch(routerRedux.push('/case/case-add'))
								}>
								创建新案件
							</ModeButton>
						</span>
					</div>
				</div>
			);
		}
	}
);

export default connect((state: StateTree) => ({ caseData: state.caseData }))(WrappedCase);
