import React, { MouseEvent, useRef, useState } from 'react';
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
import { withModeButton } from '@src/components/enhance';
import HiddenToggle from '@src/components/HiddenToggle/HiddenToggle';
import { Prop, FormValue } from './dataType';
import { getColumns } from './columns';
import ParseLogEntity from '@src/schema/socket/ParseLog';
import InnerPhoneList from './components/InnerAppList';
import DelLogModal from '../components/DelLogModal/DelLogModal';
import { DelLogType } from '../components/DelLogModal/ComponentType';
import './ParseLog.less';

const defaultPageSize = 10;
const ModeButton = withModeButton()(Button);

/**
 * 解析日志
 */
const ParseLog = Form.create<Prop>()((props: Prop) => {
	const isAdmin = useRef<boolean>(false);
	const [expandRowKeys, setExpandRowKeys] = useState<string[] | number[]>([]);
	const [delModalVisible, setDelModalVisible] = useState<boolean>(false);

	/**
	 * 查询Click
	 * @param props 组件属性
	 * @param event 事件对象
	 */
	const searchClick = (event: MouseEvent<HTMLButtonElement>) => {
		const { dispatch, form } = props;
		let condition: FormValue = form.getFieldsValue();
		// setExpandRowKeys([]);//#想要查询时折起所有的行，请放开注释
		dispatch({
			type: 'parseLog/queryParseLog',
			payload: {
				condition,
				current: 1,
				pageSize: defaultPageSize
			}
		});
	};

    /**
     * 打开/关闭DelModal
     * @param visible 是否显示
     */
	const showDelModalChange = (visible: boolean) => setDelModalVisible(visible);

	/**
	 * 删除日志回调
	 */
	const delLogHandle = (delType: DelLogType) => {
		const { dispatch } = props;
		dispatch({ type: 'parseLog/deleteParseLogByTime', payload: delType });
		setDelModalVisible(false);
	};
	/**
	 * 清空所有解析日志
	 */
	const dropAllLog = () => {
		const { dispatch } = props;
		Modal.confirm({
			title: '日志将清除',
			content: '日志将会全部清除且不可恢复，确认吗？',
			okText: '确定',
			cancelText: '取消',
			onOk() {
				dispatch({ type: 'parseLog/dropAllLog' });
			}
		});
	};
	/**
	 * 渲染查询表单
	 */
	const renderForm = (): JSX.Element => {
		const { Item } = Form;
		const { getFieldDecorator } = props.form;
		const { loading } = props.parseLog;
		return (
			<div className="search-bar">
				<Form layout="inline">
					<Item label="解析完成时间 起">
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
					<ModeButton type="default" onClick={() => showDelModalChange(true)}>
						<Icon type="delete" />
						<span>清理</span>
					</ModeButton>
					<HiddenToggle show={isAdmin.current}>
						<ModeButton type="danger" onClick={() => dropAllLog()}>
							<Icon type="delete" />
							<span>全部清除</span>
						</ModeButton>
					</HiddenToggle>
				</div>
			</div>
		);
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
			type: 'parseLog/queryParseLog',
			payload: {
				condition,
				current,
				pageSize
			}
		});
	};

	/**
	 * 渲染表格
	 */
	const renderTable = (): JSX.Element => {
		return (
			<Table<ParseLogEntity>
				dataSource={props.parseLog.data}
				columns={getColumns(props.dispatch, isAdmin.current)}
				loading={props.parseLog.loading}
				expandedRowRender={(record) => (
					<InnerPhoneList data={record.apps!} dispatch={props.dispatch} />
				)}
				bordered={true}
				expandRowByClick={true}
				size="small"
				pagination={{
					current: props.parseLog.current,
					pageSize: props.parseLog.pageSize,
					total: props.parseLog.total,
					onChange: pageChange
				}}
				rowClassName={(record: ParseLogEntity, index: number) =>
					index % 2 === 0 ? 'even-row' : 'odd-row'
				}
				expandedRowKeys={expandRowKeys}
				onExpandedRowsChange={(rowKeys: string[] | number[]) => setExpandRowKeys(rowKeys)}
				locale={{ emptyText: <Empty description="暂无数据" /> }}
			/>
		);
	};

	useMount(() => {
		const { form } = props;
		const [, roleName] = props.location.search.split('=');
		const condition: FormValue = form.getFieldsValue();
		isAdmin.current = roleName === 'admin';
		props.dispatch({
			type: 'parseLog/queryParseLog',
			payload: {
				condition,
				current: 1,
				pageSize: defaultPageSize
			}
		});
	});

	return (
		<div className="parse-log-root">
			<div className="search-form">{renderForm()}</div>
			<div className="scroll-panel">
				<div className="table-panel">{renderTable()}</div>
			</div>
			<DelLogModal
				visible={delModalVisible}
				okHandle={delLogHandle}
				cancelHandle={() => showDelModalChange(false)}
			/>
		</div>
	);
});

export default connect((state: any) => ({ parseLog: state.parseLog }))(ParseLog);
