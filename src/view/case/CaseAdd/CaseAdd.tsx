import React, { Component, createRef, RefObject } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Title from '@src/components/title/Title';
import { StateTree } from '@src/type/model';
import { helper } from '@utils/helper';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { LocalStoreKey } from '@utils/localStore';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { CParseApp } from '@src/schema/CParseApp';
import { TokenApp } from '@src/schema/TokenApp';
import { Prop, State, FormValue } from './componentType';
import AddForm from './AddForm';
import './CaseAdd.less';

const { max } = helper.readConf();
const { Option } = Select;

/**
 * 新增案件
 */
class CaseAdd extends Component<Prop, State> {
	/**
	 * 当前所选采集人员姓名
	 */
	currentOfficerName: string;
	/**
	 * 表单引用
	 */
	formRef: RefObject<any>;
	/**
	 * 选中的解析应用列表
	 */
	parseAppList: CParseApp[];
	/**
	 * 选中的Token云取证列表
	 */
	tokenAppList: TokenApp[];

	constructor(props: Prop) {
		super(props);
		this.currentOfficerName = '';
		this.formRef = createRef<any>();
		this.parseAppList = [];
		this.tokenAppList = [];
		this.state = {
			sdCard: max === 2 ? false : true,
			hasReport: true,
			autoParse: true,
			generateBcp: false,
			disableGenerateBcp: false,
			attachment: false,
			disableAttachment: true,
			isDel: false,
			isAi: false,
			historyUnitNames: []
		};
		this.saveCase = debounce(this.saveCase, 1200, {
			leading: true,
			trailing: false
		});
	}
	componentDidMount() {
		const { dispatch } = this.props;
		this.setState({ historyUnitNames: UserHistory.get(HistoryKeys.HISTORY_UNITNAME) });
		dispatch({ type: 'caseAdd/queryOfficer' });
	}
	/**
	 * 保存案件
	 */
	saveCase(entity: CCaseInfo) {
		const { dispatch } = this.props;
		dispatch({ type: 'caseAdd/saveCase', payload: entity });
	}
	/**
	 * 保存案件Click事件
	 */
	saveCaseClick = () => {
		const { validateFields } = this.formRef.current;
		const { sdCard, hasReport, autoParse, generateBcp, attachment, isDel, isAi } = this.state;
		validateFields((err: Error, values: FormValue) => {
			if (helper.isNullOrUndefined(err)) {
				let entity = new CCaseInfo();
				entity.m_strCaseName = `${values.currentCaseName.replace(
					/_/g,
					''
				)}_${helper.timestamp()}`;
				entity.m_strCasePath = values.m_strCasePath;
				entity.spareName = '';
				entity.m_strCheckUnitName = values.checkUnitName;
				entity.sdCard = sdCard;
				entity.hasReport = hasReport;
				entity.m_bIsAutoParse = autoParse;
				entity.m_Applist = this.parseAppList;
				entity.tokenAppList = this.tokenAppList;
				entity.generateBcp = generateBcp;
				entity.attachment = attachment;
				entity.isDel = isDel;
				entity.officerNo = values.officerNo;
				entity.officerName = this.currentOfficerName;
				entity.securityCaseNo = values.securityCaseNo;
				entity.securityCaseType = values.securityCaseType;
				entity.securityCaseName = values.securityCaseName;
				entity.handleCaseNo = values.handleCaseNo;
				entity.handleCaseType = values.handleCaseType;
				entity.handleCaseName = values.handleCaseName;
				// entity.handleOfficerNo = values.handleOfficerNo;
				entity.isAi = isAi;
				entity.aiThumbnail = values.aiThumbnail;
				entity.aiWeapon = values.aiWeapon;
				entity.aiDoc = values.aiDoc;
				entity.aiDrug = values.aiDrug;
				entity.aiNude = values.aiNude;
				entity.aiMoney = values.aiMoney;
				entity.aiDress = values.aiDress;
				entity.aiTransport = values.aiTransport;
				entity.aiCredential = values.aiCredential;
				entity.aiTransfer = values.aiTransfer;
				entity.aiScreenshot = values.aiScreenshot;
				this.saveCase(entity);
			}
		});
	};
	/**
	 * 拉取SD卡Change事件
	 */
	sdCardChange = (e: CheckboxChangeEvent) => {
		let { checked } = e.target;
		this.setState({ sdCard: checked });
	};
	/**
	 * 生成报告Change事件
	 */
	hasReportChange = (e: CheckboxChangeEvent) => {
		let { checked } = e.target;
		this.setState({ hasReport: checked });
	};
	/**
	 * 自动解析Change事件
	 */
	autoParseChange = (e: CheckboxChangeEvent) => {
		const { resetFields } = this.formRef.current;
		let { checked } = e.target;
		this.setState({
			autoParse: checked,
			disableGenerateBcp: !checked,
			disableAttachment: !checked
		});
		if (!checked) {
			this.setState({
				generateBcp: false,
				attachment: false
			});
			resetFields(['officerNo']);
		}
	};
	/**
	 * 生成BCPChange事件
	 */
	generateBcpChange = (e: CheckboxChangeEvent) => {
		let { checked } = e.target;
		this.setState({
			generateBcp: checked,
			disableAttachment: !checked
		});
		if (!checked) {
			this.setState({
				attachment: false
			});
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
	 * 有无附件Change事件
	 */
	attachmentChange = (e: CheckboxChangeEvent) => {
		let { checked } = e.target;
		this.setState({
			attachment: checked
		});
	};
	/**
	 * 是否删除原数据Change事件
	 */
	isDelChange = (e: CheckboxChangeEvent) => {
		let { checked } = e.target;
		this.setState({ isDel: checked });
	};
	/**
	 * 是否进行AI分析
	 */
	isAiChange = (e: CheckboxChangeEvent) => {
		let { checked } = e.target;
		this.setState({ isAi: checked });
	};
	/**
	 * 采集人员Change事件
	 */
	officerChange = (
		value: string,
		option: React.ReactElement<any> | React.ReactElement<any>[]
	) => {
		this.currentOfficerName = (option as any).props['data-name'];
	};
	/**
	 * 绑定采集人员Options
	 */
	bindOfficerOptions = () => {
		const { officerList } = this.props.caseAdd;
		return officerList.map((opt) => {
			return (
				<Option value={opt.no} data-name={opt.name}>
					{`${opt.name}（${opt.no}）`}
				</Option>
			);
		});
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
	tokenAppSelectHandle = (nodes: TokenApp[]) => (this.tokenAppList = nodes);
	render(): JSX.Element {
		const { dispatch } = this.props;
		return (
			<div className="case-add-panel">
				<div className="box-sp">
					<Title
						returnText="返回"
						okText="确定"
						onReturn={() => dispatch(routerRedux.push('/case'))}
						onOk={() => {
							this.saveCaseClick();
						}}>
						新增案件
					</Title>
				</div>
				<div className="form-panel">
					<AddForm ref={this.formRef} parameter={this.state} context={this as any} />
				</div>
			</div>
		);
	}
}

export default connect((state: StateTree) => ({ caseAdd: state.caseAdd }))(CaseAdd);
