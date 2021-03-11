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
import DataColor from '@src/components/DataColor/DataColor';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@utils/helper';
import { getColumns } from './columns';
import InnerPhoneTable from './components/InnerPhoneTable';
import { importDevice } from './helper';
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
		 * 导入检材handle
		 */
		selectImportHandle = debounce(
			async (e: MouseEvent<HTMLButtonElement>) => {
				const dialogVal = await dialog.showOpenDialog({
					title: '请选择检材（手机）目录',
					properties: ['openDirectory']
				});

				if (dialogVal.filePaths && dialogVal.filePaths.length > 0) {
					const valid = await this.validJsonInDir(dialogVal.filePaths[0]);
					if (valid) {
						this.startImport(dialogVal.filePaths[0]);
					}
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
					content: 'Case.json 或 Devce.json 文件缺失',
					okText: '确定'
				});
				return false;
			}
			return true;
		};
		/**
		 * 开始执行导入
		 * @param devicePath 手机路径
		 */
		startImport = async (devicePath: string) => {
			const { dispatch } = this.props;
			const importModal = Modal.info({
				content: '正在导入检材，请不要关闭程序',
				okText: '确定',
				maskClosable: false,
				okButtonProps: { disabled: true, icon: 'loading' }
			});
			try {
				await importDevice(devicePath);
				dispatch({ type: 'caseData/fetchCaseData', payload: { current: 1 } });
				this.setState({ expendRowKeys: [] });
				importModal.update({
					content: '检材导入成功',
					okButtonProps: { disabled: false, icon: 'check-circle' }
				});
			} catch (error) {
				importModal.update({
					title: '导入失败',
					content: `错误消息：${error.message}`,
					okButtonProps: { disabled: false, icon: 'check-circle' }
				});
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
					<div className="color-panel">
						<DataColor />
					</div>
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
						<span className={classnames({ hidden: !this.state.isAdmin })}>
							<ModeButton
								onClick={this.selectImportHandle}
								type="primary"
								icon="import">
								导入检材
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
