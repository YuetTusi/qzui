import path from 'path';
import { mkdirSync } from 'fs';
import querystring from 'querystring';
import { remote } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import ProgressModal from './components/ProgressModal/ProgressModal';
import InnerPhoneTable from './components/InnerPhoneTable/InnerPhoneTable';
import EditDeviceModal from './components/EditDeviceModal/EditDeviceModal';
import ExportReportModal from './components/ExportReportModal/ExportReportModal';
import CCaseInfo from '@src/schema/CCaseInfo';
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import { TableName } from '@src/schema/db/TableName';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { send } from '@src/service/tcpServer';
import { DbInstance } from '@src/type/model';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { Prop, State } from './componentType';
import { getColumns } from './columns';
import './Parse.less';

const getDb = remote.getGlobal('getDb');

/**
 * 解析列表
 */
class Parse extends Component<Prop, State> {
	/**
	 * 正在查看详情的设备
	 */
	progressDevice?: DeviceType;
	/**
	 * 当前导出报告的设备
	 */
	exportReportDevice?: DeviceType;
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
			exportReportModalVisible: false,
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
		setTimeout(() => {
			dispatch({ type: 'parse/fetchCaseData', payload: { current: this.pageIndex } });
		});
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
	startParseHandle = async (device: DeviceType) => {
		const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
		const { dispatch } = this.props;
		let useKeyword = localStorage.getItem(LocalStoreKey.UseKeyword) === '1';
		let dataMode = Number(localStorage.getItem(LocalStoreKey.DataMode));
		let caseData: CCaseInfo = await db.findOne({ _id: device.caseId });
		let caseJsonPath = path.join(device.phonePath!, '../../Case.json');

		let caseJsonExist = await helper.existFile(caseJsonPath);
		if (!caseJsonExist) {
			await helper.writeJSONfile(caseJsonPath, {
				caseName: caseData?.m_strCaseName ?? '',
				checkUnitName: caseData?.m_strCheckUnitName ?? '',
				officerName: caseData?.officerName ?? '',
				officerNo: caseData?.officerNo ?? '',
				securityCaseNo: caseData?.securityCaseNo ?? '',
				securityCaseType: caseData?.securityCaseType ?? '',
				securityCaseName: caseData?.securityCaseName ?? '',
				handleCaseNo: caseData?.handleCaseNo ?? '',
				handleCaseName: caseData?.handleCaseName ?? '',
				handleCaseType: caseData?.handleCaseType ?? '',
				handleOfficerNo: caseData?.handleOfficerNo ?? ''
			});
		}

		//LEGACY: 此处为补丁代码，为保证旧版代码因无Device.json文件而
		//LEGACY: 无法解析数据而临时在解析前写入Device.json，将来会删除
		let deviceJsonExist = await helper.existFile(device.phonePath!);
		if (!deviceJsonExist) {
			//手机路径不存在，创建之
			mkdirSync(device.phonePath!);
		}
		//将设备信息写入Device.json
		await helper.writeJSONfile(path.join(device.phonePath!, 'Device.json'), {
			mobileHolder: device.mobileHolder ?? '',
			mobileNo: device.mobileNo ?? '',
			mobileName: device.mobileName ?? '',
			note: device.note ?? ''
		});
		//LEGACY ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

		send(SocketType.Parse, {
			type: SocketType.Parse,
			cmd: CommandType.StartParse,
			msg: {
				caseId: device.caseId,
				deviceId: device.id,
				phonePath: device.phonePath,
				hasReport: caseData?.hasReport ?? false,
				isDel: caseData?.isDel ?? false,
				useKeyword,
				dataMode,
				cloudAppList: caseData.cloudAppList
					? caseData.cloudAppList.map((i) => i.m_strID)
					: []
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
	 * 打开导出报告框handle
	 * @param device 设备对象
	 */
	openExportReportModalHandle = (device: DeviceType) => {
		this.exportReportDevice = device;
		this.setState({ exportReportModalVisible: true });
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
	 * 关闭导出报告框
	 */
	exportReportModalCloseHandle = () => {
		this.exportReportDevice = undefined;
		this.setState({ exportReportModalVisible: false });
	};
	/**
	 * 展开/收起行
	 * @param rowKeys 行key数组
	 */
	onExpandedRowsChange = (rowKeys: string[] | number[]) =>
		this.setState({ expendRowKeys: rowKeys });
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
	renderSubTable = (caseData: CCaseInfo, index: number, indent: number, expanded: boolean) => (
		<InnerPhoneTable
			startParseHandle={this.startParseHandle}
			progressHandle={this.progressHandle}
			toBcpHandle={this.toBcpHandle}
			editHandle={this.editHandle}
			openExportReportModalHandle={this.openExportReportModalHandle}
			pageChange={this.subTablePageChange}
			caseData={caseData}
			pageIndex={this.subPageMap.get(caseData._id!)}
			expended={expanded}
		/>
	);
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
						locale={{ emptyText: <Empty description="无案件数据" /> }}
						rowKey={(record) => record._id!}
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
				<ExportReportModal
					visible={this.state.exportReportModalVisible}
					device={this.exportReportDevice}
					closeHandle={this.exportReportModalCloseHandle}
				/>
			</div>
		);
	}
}

export default connect((state: any) => ({ parse: state.parse }))(Parse);
