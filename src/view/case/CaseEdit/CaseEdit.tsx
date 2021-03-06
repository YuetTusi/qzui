import React, { Component, createRef, RefObject } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Title from '@src/components/title/Title';
import EditForm from './EditForm';
import { Prop, State } from './ComponentType';
import { CParseApp } from '@src/schema/CParseApp';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@utils/helper';
import { LocalStoreKey } from '@utils/localStore';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { LeftUnderline } from '@utils/regex';
import { CaseForm } from './CaseForm';
import './CaseEdit.less';

const { Option } = Select;

/**
 * 案件编辑页
 */
class CaseEdit extends Component<Prop, State> {
	/**
	 * 寄存当前采集人员姓名
	 */
	currentOfficerName: string;
	/**
	 * 表单引用
	 */
	formRef: RefObject<any>;
	/**
	 * 解析App列表
	 */
	parseAppList: CParseApp[];
	/**
	 * 云取证App列表
	 */
	cloudAppList: CParseApp[];

	constructor(props: any) {
		super(props);
		this.currentOfficerName = '';
		this.formRef = createRef();
		this.parseAppList = [];
		this.cloudAppList = [];
		this.state = {
			historyUnitNames: [],
			titleCaseName: ''
		};
		this.saveCase = debounce(this.saveCase, 1200, {
			leading: true,
			trailing: false
		});
	}
	componentDidMount() {
		const { match } = this.props;
		const { dispatch } = this.props;
		const names: string[] = UserHistory.get(HistoryKeys.HISTORY_UNITNAME);
		this.setState({ historyUnitNames: names });
		dispatch({ type: 'caseEdit/queryCaseById', payload: match.params.id });
		dispatch({ type: 'caseEdit/queryOfficerList' });
	}
	componentWillUnmount() {
		const { dispatch } = this.props;
		dispatch({ type: 'caseEdit/setData', payload: {} });
	}
	/**
	 * 绑定采集人员Options
	 */
	bindOfficerOptions = () => {
		const { officerList } = this.props.caseEdit;
		return officerList.map((opt) => {
			return (
				<Option value={opt.no} data-name={opt.name}>
					{`${opt.name}（${opt.no}）`}
				</Option>
			);
		});
	};
	/**
	 * 采集人员初始化值
	 * @param officerNo 采集人员编号
	 */
	getOfficerInitVal = (officerNo: string) => {
		const { officerList } = this.props.caseEdit;
		if (officerList.find((i) => i.no === officerNo)) {
			return officerNo;
		} else {
			return undefined;
		}
	};
	/**
	 * 拉取SD卡Change
	 */
	sdCardChange = (e: CheckboxChangeEvent) => {
		const { dispatch } = this.props;
		const { checked } = e.target;
		dispatch({ type: 'caseEdit/setSdCard', payload: checked });
	};
	/**
	 * 生成报告Change
	 */
	hasReportChange = (e: CheckboxChangeEvent) => {
		const { dispatch } = this.props;
		const { checked } = e.target;
		dispatch({ type: 'caseEdit/setHasReport', payload: checked });
	};
	/**
	 * 自动解析Change事件
	 */
	autoParseChange = (e: CheckboxChangeEvent) => {
		const { dispatch } = this.props;
		let { checked } = e.target;
		dispatch({ type: 'caseEdit/setAutoParse', payload: checked });
		if (!checked) {
			dispatch({ type: 'caseEdit/setGenerateBcp', payload: false });
			dispatch({ type: 'caseEdit/setAttachment', payload: false });
		}
	};
	/**
	 * 生成BCPChange事件
	 */
	generateBcpChange = (e: CheckboxChangeEvent) => {
		const { dispatch } = this.props;
		const { resetFields } = this.formRef.current;
		let { checked } = e.target;
		dispatch({ type: 'caseEdit/setGenerateBcp', payload: checked });
		if (!checked) {
			resetFields(['officerNo']);
			dispatch({ type: 'caseEdit/setAttachment', payload: false });
		}
		if (checked && this.isUnitEmpty()) {
			Modal.info({
				title: '提示',
				content: (
					<p>
						<div>
							暂未设置<strong>采集单位</strong>或<strong>目的检验单位</strong>信息
						</div>
						<div>请在「设置」菜单进行配置</div>
					</p>
				),
				okText: '确定'
			});
		}
	};
	/**
	 * 是否有附件Change事件
	 */
	attachmentChange = (e: CheckboxChangeEvent) => {
		const { dispatch } = this.props;
		let { checked } = e.target;
		dispatch({ type: 'caseEdit/setAttachment', payload: checked });
	};
	/**
	 * 是否删除原数据Change事件
	 */
	isDelChange = (e: CheckboxChangeEvent) => {
		const { dispatch } = this.props;
		let { checked } = e.target;
		dispatch({ type: 'caseEdit/setIsDel', payload: checked });
	};
	/**
	 * 采集人员Change
	 */
	officerChange = (
		value: string,
		option: React.ReactElement<any> | React.ReactElement<any>[]
	) => {
		this.currentOfficerName = (option as JSX.Element).props['data-name'];
	};
	/**
	 * 验证是否设置了`采集单位`和`目的检验单位`
	 */
	isUnitEmpty = () => {
		return (
			localStorage.getItem(LocalStoreKey.UnitCode) === null ||
			localStorage.getItem(LocalStoreKey.DstUnitCode) === null
		);
	};
	/**
	 * 解析App选择Handle
	 * @param nodes 所选zTree结点
	 */
	parseAppSelectHandle = (nodes: CParseApp[]) => (this.parseAppList = nodes);
	/**
	 * 云取证App选择Handle
	 * @param nodes 所选zTree结点
	 */
	cloudAppSelectHandle = (nodes: CParseApp[]) => (this.cloudAppList = nodes);
	/**
	 * 保存案件Click事件
	 */
	saveCaseClick = () => {
		const { validateFields } = this.formRef.current;
		const {
			sdCard,
			hasReport,
			m_bIsAutoParse,
			generateBcp,
			attachment,
			isDel,
			m_strCaseName,
			officerName
		} = this.props.caseEdit.data;
		validateFields((err: Error, values: CaseForm) => {
			if (helper.isNullOrUndefined(err)) {
				let entity = new CCaseInfo();
				entity.m_strCaseName = m_strCaseName;
				entity.m_strCasePath = values.m_strCasePath;
				entity.m_strCheckUnitName = values.m_strCheckUnitName;
				entity.sdCard = sdCard;
				entity.hasReport = hasReport;
				entity.m_bIsAutoParse = m_bIsAutoParse;
				entity.generateBcp = generateBcp;
				entity.attachment = attachment;
				entity.isDel = isDel;
				entity.m_Applist = this.parseAppList;
				entity.cloudAppList = this.cloudAppList;
				entity.officerNo = values.officerNo;
				entity.officerName = this.currentOfficerName || officerName;
				entity.securityCaseNo = values.securityCaseNo;
				entity.securityCaseType = values.securityCaseType;
				entity.securityCaseName = values.securityCaseName;
				entity.handleCaseNo = values.handleCaseNo;
				entity.handleCaseType = values.handleCaseType;
				entity.handleCaseName = values.handleCaseName;
				entity.handleOfficerNo = values.handleOfficerNo;
				entity._id = this.props.match.params.id;
				this.saveCase(entity);
			}
		});
	};
	/**
	 * 保存案件
	 */
	saveCase = (data: CCaseInfo) => {
		const { dispatch } = this.props;
		dispatch({ type: 'caseEdit/saveCase', payload: data });
	};
	getCaseName(caseName?: string) {
		if (helper.isNullOrUndefined(caseName)) {
			return '';
		} else {
			return caseName!.match(LeftUnderline)![0];
		}
	}
	render(): JSX.Element {
		const { data } = this.props.caseEdit;
		return (
			<div className="case-edit-root">
				<div className="box-sp">
					<Title
						returnText="返回"
						okText="确定"
						onReturn={() => this.props.dispatch(routerRedux.push('/case'))}
						onOk={() => this.saveCaseClick()}>
						编辑案件 -{' '}
						<strong title={data._id}>{this.getCaseName(data.m_strCaseName)}</strong>
					</Title>
				</div>
				<div className="form-panel">
					<EditForm
						ref={this.formRef}
						data={data}
						historyUnitNames={this.state.historyUnitNames}
						context={this as any}
					/>
				</div>
			</div>
		);
	}
}

export default connect((state: any) => ({ caseEdit: state.caseEdit }))(CaseEdit);
