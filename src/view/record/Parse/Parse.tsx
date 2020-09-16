import querystring from 'querystring';
import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import ProgressModal from './components/ProgressModal/ProgressModal';
import InnerPhoneTable from './components/InnerPhoneTable/InnerPhoneTable';
import EditDeviceModal from './components/EditDeviceModal/EditDeviceModal';
import { getColumns } from './columns';
import CCaseInfo from '@src/schema/CCaseInfo';
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { send } from '@src/service/tcpServer';
import { Prop, State } from './componentType';
import './Parse.less';

/**
 * 解析列表
 */
class Parse extends Component<Prop, State> {
	/**
	 * 正在查看详情的设备
	 */
	progressDevice?: DeviceType;
	/**
	 * 案件表格当前页码
	 */
	pageIndex: number;
	/**
	 * 子表格页码键值表（用于寄存子表格页码）
	 */
	subPageMap: Map<string, number>;
	/**
	 * 当前编辑的设备数据
	 */
	editDevice: DeviceType;

	constructor(props: Prop) {
		super(props);
		this.state = {
			progressModalVisible: false,
			editModalVisible: false,
			expendRowKeys: []
		};
		this.pageIndex = 1;
		this.subPageMap = new Map();
		this.editDevice = {};
	}
	componentDidMount() {
		const { dispatch } = this.props;
		const { search } = this.props.location;
		const { cid, cp, dp } = querystring.parse(search.substring(1));
		this.pageIndex = cp ? Number(cp) : 1;
		this.subPageMap.set(cid as string, dp ? Number(dp) : 1);
		dispatch({ type: 'parse/fetchCaseData', payload: { current: this.pageIndex } });
		if (cid) {
			//展开案件
			this.setState({ expendRowKeys: [cid as string] });
		}
	}
	/**
	 * 翻页Change
	 */
	pageChange = (current: number, pageSize?: number) => {
		const { dispatch } = this.props;
		this.pageIndex = current;
		dispatch({
			type: 'parse/fetchCaseData',
			payload: {
				current,
				pageSize
			}
		});
	};
	/**
	 * 开始解析
	 * @param device 设备对象
	 */
	startParseHandle = (device: DeviceType) => {
		const { dispatch } = this.props;
		send(SocketType.Parse, {
			type: SocketType.Parse,
			cmd: CommandType.StartParse,
			msg: {
				caseId: device.caseId,
				deviceId: device.id,
				phonePath: device.phonePath
			}
		});
		dispatch({
			type: 'parse/updateParseState',
			payload: {
				id: device.id,
				parseState: ParseState.Parsing
			}
		});
	};
	/**
	 * 删除案件数据
	 */
	delCaseHandle = (data: CCaseInfo) => {
		const { dispatch } = this.props;
		dispatch({
			type: 'parse/deleteCaseData',
			payload: {
				id: data._id,
				casePath: data.m_strCasePath
			}
		});
	};
	/**
	 * 查看解析详情Handle
	 * @param device 设备对象
	 */
	progressHandle = (device: DeviceType) => {
		this.progressDevice = device;
		this.setState({ progressModalVisible: true });
	};
	/**
	 * 生成BCP（单条）
	 * @param device 手机数据
	 * @param caseId 案件id
	 */
	toBcpHandle = (device: DeviceType, caseId: string) => {
		const { dispatch } = this.props;
		let casePageIndex = this.pageIndex;
		let devicePageIndex = this.subPageMap.has(caseId) ? this.subPageMap.get(caseId) : 1;
		//单条时，第2个路由参数传手机id
		dispatch(
			routerRedux.push(
				`/record/bcp/${caseId}/${device.id}?cp=${casePageIndex}&dp=${devicePageIndex}`
			)
		);
	};
	/**
	 * 编辑设备
	 * @param device 设备数据
	 */
	editHandle = (device: DeviceType) => {
		this.editDevice = device;
		this.setState({ editModalVisible: true });
	};
	/**
	 * 编辑设备保存
	 * @param device 设备数据
	 */
	editSaveHandle = (device: DeviceType) => {
		const { dispatch } = this.props;
		dispatch({ type: 'parse/updateDevice', payload: device });
		this.setState({ editModalVisible: false });
	};
	/**
	 * 编辑弹框关闭handle
	 */
	editModalCancelHandle = () => {
		this.editDevice = {};
		this.setState({ editModalVisible: false });
	};
	/**
	 * 展开/收起行
	 * @param rowKeys 行key数组
	 */
	onExpandedRowsChange = (rowKeys: string[] | number[]) => {
		this.setState({ expendRowKeys: rowKeys });
	};
	/**
	 * 子表格翻页Change
	 * @param pageIndex 当前页
	 * @param caseId 案件id
	 */
	subTablePageChange = (pageIndex: number, caseId: string) => {
		//# 在此维护键值表，保存案件id与页号的对应关系
		//# 从BCP页面返回时带回页号，以展开相应的行
		this.subPageMap.set(caseId, pageIndex);
	};
	/**
	 * 渲染子表格
	 */
	renderSubTable = (
		caseData: CCaseInfo,
		index: number,
		indent: number,
		expanded: boolean
	): JSX.Element => {
		return (
			<InnerPhoneTable
				startParseHandle={this.startParseHandle}
				progressHandle={this.progressHandle}
				toBcpHandle={this.toBcpHandle}
				editHandle={this.editHandle}
				pageChange={this.subTablePageChange}
				caseData={caseData}
				pageIndex={this.subPageMap.get(caseData._id!)}
				expended={expanded}
			/>
		);
	};
	render(): JSX.Element {
		const {
			dispatch,
			parse: { loading, caseData, total, current, pageSize }
		} = this.props;
		return (
			<div className="parse-root">
				<div className="scroll-panel">
					<Table<CCaseInfo>
						columns={getColumns(dispatch)}
						expandedRowRender={this.renderSubTable}
						expandedRowKeys={this.state.expendRowKeys}
						onExpandedRowsChange={this.onExpandedRowsChange}
						expandRowByClick={true}
						dataSource={caseData}
						locale={{ emptyText: <Empty description="暂无数据" /> }}
						rowKey={(record: CCaseInfo) => record._id!}
						bordered={true}
						pagination={{
							total,
							current,
							pageSize,
							onChange: this.pageChange
						}}
						loading={loading}
					/>
				</div>
				<ProgressModal
					visible={this.state.progressModalVisible}
					device={this.progressDevice!}
					cancelHandle={() => {
						this.progressDevice = undefined;
						this.setState({ progressModalVisible: false });
					}}
				/>
				<EditDeviceModal
					saveHandle={this.editSaveHandle}
					cancelHandle={this.editModalCancelHandle}
					visible={this.state.editModalVisible}
					data={this.editDevice}
				/>
			</div>
		);
	}
}

export default connect((state: any) => ({ parse: state.parse }))(Parse);
