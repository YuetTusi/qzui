import path from 'path';
import { ipcRenderer, remote, IpcRendererEvent } from 'electron';
import React, { Component, FormEvent } from 'react';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Table, { PaginationConfig } from 'antd/lib/table';
import message from 'antd/lib/message';
import { withModeButton } from '@src/components/enhance';
import { helper } from '@utils/helper';
import log from '@utils/log';
import { LocalStoreKey } from '@src/utils/localStore';
import { Prop, State, UnitRecord } from './componentType';
import { getColumns } from './columns';
import './DstUnit.less';

const config: any = helper.readConf();
const ModeButton = withModeButton()(Button);
let jsonSavePath = ''; //JSON文件路径
if (process.env['NODE_ENV'] === 'development') {
	jsonSavePath = path.join(remote.app.getAppPath(), './data/unit.json');
} else {
	jsonSavePath = path.join(remote.app.getAppPath(), '../data/unit.json');
}

let DstUnitExtend = Form.create<Prop>({ name: 'search' })(
	/**
	 * 目的检验单位
	 */
	class DstUnit extends Component<Prop, State> {
		/**
		 * 用户选中的单位编号
		 */
		selectPcsCode: string | null;
		/**
		 * 用户选中的单位名称
		 */
		selectPcsName: string | null;

		constructor(props: Prop) {
			super(props);

			this.selectPcsCode = null;
			this.selectPcsName = null;

			this.state = {
				selectedRowKeys: [],
				currentPcsCode: null,
				currentPcsName: null,
				data: [],
				total: 0,
				current: 1,
				loading: false
			};
			this.saveUnit = debounce(this.saveUnit, 1000, {
				leading: true,
				trailing: false
			});
		}
		componentDidMount() {
			ipcRenderer.on('query-db-result', this.queryDbHandle);
			this.queryUnitData(null, 1);
			this.setState({
				currentPcsCode: localStorage.getItem(LocalStoreKey.DstUnitCode),
				currentPcsName: localStorage.getItem(LocalStoreKey.DstUnitName)
			});
		}
		componentWillUnmount() {
			ipcRenderer.removeListener('query-db-result', this.queryDbHandle);
		}
		/**
		 * 查询结果Handle
		 */
		queryDbHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
			if (result.success) {
				this.setState({
					data: result.data.rows,
					total: result.data.total
				});
			}
			this.setState({ loading: false });
		};
		/**
		 * 查询Submit
		 */
		searchSubmit = (e: FormEvent<HTMLFormElement>) => {
			const { getFieldValue } = this.props.form;
			let keyword = getFieldValue('pcsName') || null;
			e.preventDefault();
			this.queryUnitData(keyword, 1);
		};
		/**
		 * 查询表格数据
		 * @param keyword 关键字
		 * @param pageIndex 页码（从1开始）
		 */
		queryUnitData(keyword: string | null, pageIndex: number = 1) {
			this.setState({ loading: true });
			ipcRenderer.send('query-db', keyword, pageIndex);
		}
		/**
		 * 保存采集单位
		 */
		saveUnit() {
			const { selectedRowKeys } = this.state;
			if (selectedRowKeys.length !== 0) {
				localStorage.setItem(LocalStoreKey.DstUnitName, this.selectPcsName!);
				localStorage.setItem(LocalStoreKey.DstUnitCode, this.selectPcsCode!);
				message.destroy();
				message.success('保存成功');
				this.setState({
					currentPcsCode: this.selectPcsCode,
					currentPcsName: this.selectPcsName
				});
				this.writeJson(this.selectPcsName, this.selectPcsCode);
			} else {
				message.info('请选择采集单位');
			}
		}
		/**
		 * 确定Click事件
		 */
		saveClick = () => {
			this.saveUnit();
		};
		/**
		 * 写入JSON文件
		 * @param unitName 采集单位名称
		 * @param unitCode 采集单位编号
		 */
		writeJson = (dstUnitName: string | null, dstUnitCode: string | null) => {
			let unitCode = localStorage.getItem(LocalStoreKey.UnitCode);
			let unitName = localStorage.getItem(LocalStoreKey.UnitName);
			helper
				.writeJSONfile(jsonSavePath, {
					customUnit: config.customUnit ? 1 : 0,
					dstUnitName,
					dstUnitCode,
					unitName,
					unitCode
				})
				.catch((err) => {
					log.error(`写入JSON文件失败 @view/settings/DstUnit: ${err.message}`);
				});
		};
		/**
		 * 渲染查询表单
		 */
		renderSearchForm() {
			const { Item } = Form;
			const { getFieldDecorator } = this.props.form;
			return (
				<Form layout="inline" onSubmit={this.searchSubmit}>
					<Item label="单位名称">{getFieldDecorator('pcsName')(<Input />)}</Item>
					<Item>
						<ModeButton type="primary" htmlType="submit">
							<Icon type="search" />
							<span>查询</span>
						</ModeButton>
					</Item>
					<Item>
						<ModeButton
							type="primary"
							icon="check-circle"
							onClick={() => this.saveClick()}>
							保存
						</ModeButton>
					</Item>
				</Form>
			);
		}
		rowSelectChange = (selectedRowKeys: string[] | number[], selectedRows: UnitRecord[]) => {
			this.setState({ selectedRowKeys: selectedRowKeys });
			this.selectPcsCode = selectedRows[0].PcsCode;
			this.selectPcsName = selectedRows[0].PcsName;
		};
		/**
		 * 渲染表格
		 */
		renderUnitTable = (): JSX.Element => {
			// const { unitData, loading, pageIndex, pageSize, total } = this.props.unit;
			const { current, total, data, loading } = this.state;
			const pagination: PaginationConfig = {
				current,
				pageSize: 10,
				total,
				onChange: (pageIndex: number, pageSize: number | undefined) => {
					let { pcsName } = this.props.form.getFieldsValue();
					pcsName = pcsName || null;
					this.setState({
						selectedRowKeys: [],
						current: pageIndex
					});
					this.queryUnitData(pcsName, pageIndex);
				}
			};

			return (
				<Table<UnitRecord>
					columns={getColumns()}
					dataSource={data}
					pagination={pagination}
					bordered={true}
					rowKey={(record) => record.PcsCode}
					rowSelection={{
						type: 'radio',
						onChange: this.rowSelectChange,
						selectedRowKeys: this.state.selectedRowKeys
					}}
					loading={loading}
					locale={{ emptyText: <Empty description="暂无数据" /> }}></Table>
			);
		};
		render(): JSX.Element {
			const { currentPcsCode, currentPcsName } = this.state;
			return (
				<div className="dst-unit-root">
					<div className="table-panel">
						<div className="condition-bar">
							<div className="info-bar">
								<label>当前目的检验单位：</label>
								<em
									className={classnames({ pad: config.max <= 2 })}
									title={currentPcsCode ? `单位编号：${currentPcsCode}` : ''}>
									{currentPcsName ? currentPcsName : '未设置'}
								</em>
							</div>
							{this.renderSearchForm()}
						</div>
						<div className="scroll-panel">{this.renderUnitTable()}</div>
					</div>
				</div>
			);
		}
	}
);

export default DstUnitExtend;
