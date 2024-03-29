import path from 'path';
import { mkdirSync } from 'fs';
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import message from 'antd/lib/message';
import ProgressModal from './components/ProgressModal/ProgressModal';
import InnerPhoneTable from './components/InnerPhoneTable/InnerPhoneTable';
import EditDeviceModal from './components/EditDeviceModal/EditDeviceModal';
import ExportReportModal from './components/ExportReportModal/ExportReportModal';
import ExportBcpModal from './components/ExportBcpModal/ExportBcpModal';
import BatchExportReportModal from './components/BatchExportReportModal/BatchExportReportModal';
import HitChartModal from './components/HitChartModal';
import ScanModal from '@src/view/case/CaseData/components/ScanModal';
import { PredictJson } from '@src/view/case/AISwitch/prop';
import { DataMode } from '@src/schema/DataMode';
import CCaseInfo, { CaseType } from '@src/schema/CCaseInfo';
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import { TableName } from '@src/schema/db/TableName';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { send } from '@src/service/tcpServer';
import { StateTree } from '@src/type/model';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import { Prop, State } from './componentType';
import { getColumns } from './columns';
import './Parse.less';

const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';
const { caseText } = helper.readConf();

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
			exportBcpModalVisible: false,
			batchExportReportModalVisible: false,
			expendRowKeys: [],
			checkCaseId: null,
			ip: ''
		};
		this.pageIndex = 1;
		this.subPageMap = new Map();
		this.editDevice = {};
	}
	componentDidMount() {
		const { dispatch, location } = this.props;
		const params = new URLSearchParams(location.search);
		const cid = params.get('cid');
		const cp = params.get('cp');
		const dp = params.get('dp');
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
		const { dispatch } = this.props;
		const useDefaultTemp = localStorage.getItem(LocalStoreKey.UseDefaultTemp) === '1';
		let useKeyword = localStorage.getItem(LocalStoreKey.UseKeyword) === '1';
		let useDocVerify = localStorage.getItem(LocalStoreKey.UseDocVerify) === '1';
		let usePdfOcr = localStorage.getItem(LocalStoreKey.UsePdfOcr) === '1';
		let caseData: CCaseInfo = await ipcRenderer.invoke('db-find-one', TableName.Case, {
			_id: device.caseId
		});
		let aiConfig: PredictJson = { config: [], similarity: 0, ocr: false };
		const tempAt = isDev
			? path.join(cwd, './data/predict.json')
			: path.join(cwd, './resources/config/predict.json'); //模版路径
		const predictAt = path.join(caseData.m_strCasePath, caseData.m_strCaseName, 'predict.json');
		let caseJsonPath = path.join(device.phonePath!, '../../');

		const [caseJsonExist, predictExist, aiTemp] = await Promise.all([
			helper.existFile(path.join(caseJsonPath, 'Case.json')),
			helper.existFile(predictAt),
			helper.readJSONFile(tempAt)
		]);
		if (predictExist) {
			//predict.json存在
			const next: PredictJson = await helper.readJSONFile(predictAt);
			aiConfig = helper.combinePredict(aiTemp, next);
		}

		if (!caseJsonExist) {
			await helper.writeCaseJson(caseJsonPath, caseData);
		}

		//LEGACY: 此处为补丁代码，为保证旧版代码因无Device.json文件而
		//LEGACY: 无法解析数据而临时在解析前写入Device.json，将来会删除
		let deviceJsonExist = await helper.existFile(device.phonePath!);
		if (!deviceJsonExist) {
			//手机路径不存在，创建之
			mkdirSync(device.phonePath!);
		}
		if (caseData.caseType === CaseType.QuickCheck) {
			//快速点验
			//# 通知parse开始解析
			send(SocketType.Parse, {
				type: SocketType.Parse,
				cmd: CommandType.StartParse,
				msg: {
					caseId: device.caseId,
					deviceId: device.id,
					phonePath: device.phonePath,
					ruleFrom: caseData.ruleFrom ?? 0,
					ruleTo: caseData.ruleTo ?? 8,
					dataMode: DataMode.Check,
					hasReport: true,
					isDel: false,
					isAi: false,
					useAiOcr: !caseData.isPhotoAnalysis,
					isPhotoAnalysis: caseData.isPhotoAnalysis ?? false,
					aiTypes: aiConfig,
					useDefaultTemp,
					useKeyword: true,
					useDocVerify: [false, false],
					tokenAppList: []
				}
			});
		} else {
			//将设备信息写入Device.json
			await helper.writeJSONfile(path.join(device.phonePath!, 'Device.json'), {
				mobileHolder: device.mobileHolder ?? '',
				mobileNo: device.mobileNo ?? '',
				mobileName: device.mobileName ?? '',
				note: device.note ?? '',
				mode: device.mode ?? DataMode.Self
			});
			//LEGACY ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			send(SocketType.Parse, {
				type: SocketType.Parse,
				cmd: CommandType.StartParse,
				msg: {
					caseId: device.caseId,
					deviceId: device.id,
					phonePath: device.phonePath,
					ruleFrom: caseData.ruleFrom ?? 0,
					ruleTo: caseData.ruleTo ?? 8,
					hasReport: caseData?.hasReport ?? false,
					isDel: caseData?.isDel ?? false,
					isAi: caseData?.isAi ?? false,
					useAiOcr: !caseData.isPhotoAnalysis,
					isPhotoAnalysis: caseData.isPhotoAnalysis ?? false,
					aiTypes: aiConfig,
					useDefaultTemp,
					useKeyword,
					useDocVerify: [useDocVerify, usePdfOcr],
					dataMode: device.mode ?? DataMode.Self,
					tokenAppList: caseData.tokenAppList
						? caseData.tokenAppList.map((i) => i.m_strID)
						: []
				}
			});
		}
		dispatch({
			type: 'parse/updateParseState',
			payload: {
				id: device.id,
				parseState: ParseState.Parsing,
				pageIndex: this.pageIndex
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
	 * 打开导出BCP框handle
	 * @param device 设备对象
	 */
	openExportBcpModalHandle = (device: DeviceType) => {
		const { dispatch } = this.props;
		dispatch({ type: 'exportBcpModal/setIsBatch', payload: false });
		dispatch({ type: 'exportBcpModal/setExportBcpDevice', payload: device });
		this.setState({ exportBcpModalVisible: true });
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
	 * 跳转到App应用查询页
	 * @param device 手机数据
	 * @param caseId 案件id
	 */
	toTrailHandle = (device: DeviceType, caseId: string) => {
		const { dispatch } = this.props;
		let casePageIndex = this.pageIndex;
		let devicePageIndex = this.subPageMap.has(caseId) ? this.subPageMap.get(caseId) : 1;

		//单条时，第2个路由参数传手机id
		dispatch(
			routerRedux.push(
				`/record/trail/${caseId}/${device.id}?cp=${casePageIndex}&dp=${devicePageIndex}`
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
	 * 显示/隐藏批量导出BCP弹框
	 * @param visible 显示/隐藏
	 */
	exportBcpModalVisibleChange = (visible: boolean) =>
		this.setState({ exportBcpModalVisible: visible });
	/**
	 * 显示/隐藏批量导出报告弹框
	 * @param visible 显示/隐藏
	 */
	batchExportReportModalVisibleChange = (visible: boolean) =>
		this.setState({ batchExportReportModalVisible: visible });
	/**
	 * 导出BCP handle
	 * @param bcpList BCP文件列表
	 * @param destination 导出目录
	 */
	exportBcpHandle = async (bcpList: string[], destination: string) => {
		const { dispatch } = this.props;
		dispatch({ type: 'exportBcpModal/setExporting', payload: true });
		try {
			await helper.copyFiles(bcpList, destination);
			message.success('BCP导出成功');
		} catch (error) {
			message.error(`导出失败 ${error.message}`);
		} finally {
			dispatch({ type: 'exportBcpModal/setExporting', payload: false });
			this.setState({ exportBcpModalVisible: false });
		}
	};
	/**
	 * 点验案件点击
	 */
	onCheckCaseNameClick = (data: CCaseInfo, ip: string) => {
		this.setState({
			checkCaseId: data._id!,
			ip
		});
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
			toTrailHandle={this.toTrailHandle}
			editHandle={this.editHandle}
			openExportReportModalHandle={this.openExportReportModalHandle}
			openExportBcpModalHandle={this.openExportBcpModalHandle}
			pageChange={this.subTablePageChange}
			caseData={caseData}
			pageIndex={this.subPageMap.get(caseData._id!)}
			expended={expanded}
		/>
	);
	render(): JSX.Element {
		const { dispatch } = this.props;
		const { loading, caseData, total, current, pageSize } = this.props.parse;

		return (
			<div className="parse-root">
				<div className="scroll-panel">
					<Table<CCaseInfo>
						columns={getColumns(dispatch, this)}
						expandedRowRender={this.renderSubTable}
						expandedRowKeys={this.state.expendRowKeys}
						onExpandedRowsChange={this.onExpandedRowsChange}
						expandRowByClick={true}
						dataSource={caseData}
						locale={{ emptyText: <Empty description={`无${caseText ?? '案件'}数据`} /> }}
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
				<ExportBcpModal
					visible={this.state.exportBcpModalVisible}
					okHandle={this.exportBcpHandle}
					cancelHandle={() => this.exportBcpModalVisibleChange(false)}
				/>
				<BatchExportReportModal
					visible={this.state.batchExportReportModalVisible}
					okHandle={() => { }}
					cancelHandle={() => {
						dispatch({ type: 'batchExportReportModal/setDevices', payload: [] });
						this.batchExportReportModalVisibleChange(false);
					}}
				/>
				<HitChartModal />
				<ScanModal
					visible={this.state.checkCaseId !== null}
					caseId={this.state.checkCaseId!}
					ip={this.state.ip}
					cancelHandle={() => {
						this.setState({ checkCaseId: null });
						dispatch({ type: 'caseData/setCheckCaseId', payload: null })
					}}
				/>
			</div>
		);
	}
}

export default connect((state: StateTree) => ({
	parse: state.parse,
	innerPhoneTable: state.innerPhoneTable,
	exportBcpModal: state.exportBcpModal
}))(Parse);
