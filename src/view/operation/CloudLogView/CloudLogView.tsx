import React, { MouseEvent, useState } from 'react';
import { connect } from 'dva';
import Form from 'antd/lib/form';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Table from 'antd/lib/table';
import Button from 'antd/lib/button';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Modal from 'antd/lib/modal';
import { useMount } from '@src/hooks';
import { getColumns } from './columns';
import { Prop, FormValue } from './CloudLogViewProp';
import { withModeButton } from '@src/components/enhance';
import './CloudLogView.less';
import HiddenToggle from '@src/components/HiddenToggle/HiddenToggle';
import CloudLog from '@src/schema/socket/CloudLog';
import CloudAppDetailModal from './components/CloudAppDetailModal/CloudAppDetailModal';

const { Item } = Form;
const defaultPageSize = 10;
const ModeButton = withModeButton()(Button);

/**
 * 云取日志
 * @param props
 */
const CloudLogView = Form.create({ name: 'cloudLogForm' })((props: Prop) => {
	const { dispatch, cloudLog } = props;

	useMount(() => {
		const { form } = props;
		// const [, roleName] = props.location.search.split('=');
		const condition: FormValue = form.getFieldsValue();
		// isAdmin.current = roleName === 'admin';
		props.dispatch({
			type: 'cloudLog/queryCloudLog',
			payload: {
				condition,
				current: 1,
				pageSize: defaultPageSize
			}
		});
	});

	/**
	 * 查询Click
	 * @param props 组件属性
	 * @param event 事件对象
	 */
	const searchClick = (event: MouseEvent<HTMLButtonElement>) => {
		const { form } = props;
		let condition: FormValue = form.getFieldsValue();
		dispatch({
			type: 'cloudLog/queryCloudLog',
			payload: {
				condition,
				current: 1,
				pageSize: defaultPageSize
			}
		});
	};

	/**
	 * 换页Change
	 * @param dispatch 派发方法
	 * @param current 当前页
	 * @param pageSize 页尺寸
	 */
	const pageChange = (current: number, pageSize?: number) => {
		let condition = props.form.getFieldsValue();
		props.dispatch({
			type: 'cloudLog/queryCloudLog',
			payload: {
				condition,
				current,
				pageSize
			}
		});
	};

	/**
	 * 渲染查询表单
	 */
	const renderForm = (): JSX.Element => {
		const { Item } = Form;
		const { getFieldDecorator } = props.form;
		const { loading } = props.cloudLog;
		return (
			<div className="search-bar">
				<Form layout="inline">
					<Item label="采集时间 起">
						{getFieldDecorator('start')(
							<DatePicker showTime={true} placeholder="请选择时间" locale={locale} />
						)}
					</Item>
					<Item label="止">
						{getFieldDecorator('end')(
							<DatePicker showTime={true} placeholder="请选择时间" locale={locale} />
						)}
					</Item>
					<Item>
						<ModeButton type="primary" onClick={searchClick}>
							<Icon type={loading ? 'loading' : 'search'} />
							<span>查询</span>
						</ModeButton>
					</Item>
				</Form>
				<div className="fn">
					<ModeButton type="default" onClick={() => {}}>
						<Icon type="delete" />
						<span>清理</span>
					</ModeButton>
					<HiddenToggle show={true}>
						<ModeButton type="danger" onClick={() => {}}>
							<Icon type="delete" />
							<span>全部清除</span>
						</ModeButton>
					</HiddenToggle>
				</div>
			</div>
		);
	};

	/**
	 * 渲染表格
	 */
	const renderTable = (): JSX.Element => {
		return (
			<Table<CloudLog>
				dataSource={props.cloudLog.data}
				columns={getColumns(props.dispatch, true)}
				loading={props.cloudLog.loading}
				bordered={true}
				expandRowByClick={true}
				size="small"
				pagination={{
					current: props.cloudLog.current,
					pageSize: props.cloudLog.pageSize,
					total: props.cloudLog.total,
					onChange: pageChange
				}}
				rowKey={(record) => record._id!}
				rowClassName={(record: CloudLog, index: number) =>
					index % 2 === 0 ? 'even-row' : 'odd-row'
				}
				locale={{
					emptyText: <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				}}
			/>
		);
	};

	return (
		<div className="cloud-log-view-root">
			<div className="search-form">{renderForm()}</div>
			<div className="scroll-panel">
				<div className="table-panel">{renderTable()}</div>
			</div>

			<CloudAppDetailModal
				apps={cloudLog.apps}
				visible={cloudLog.detailVisible}
				cancelHandle={() => {
					dispatch({ type: 'cloudLog/setApps', payload: [] });
					dispatch({ type: 'cloudLog/setDetailVisible', payload: false });
				}}
			/>
		</div>
	);
});

export default connect((state: any) => ({ cloudLog: state.cloudLog }))(CloudLogView);
