import React, { Component, createRef, RefObject } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import Title from '@src/components/title/Title';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import AddForm from './AddForm';
import { Prop, State, FormValue } from './componentType';
import { helper } from '@src/utils/helper';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import apps from '@src/config/app.yaml';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { CParseApp } from '@src/schema/CParseApp';
import { LocalStoreKey } from '@utils/localStore';
import './CaseAdd.less';

const { max }: { max: number } = helper.readConf();
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

	constructor(props: Prop) {
		super(props);
		this.currentOfficerName = '';
		this.formRef = createRef<any>();
		this.state = {
			chooiseApp: false,
			sdCard: max === 2 ? false : true,
			hasReport: true,
			autoParse: true,
			generateBcp: false,
			disableGenerateBcp: false,
			attachment: false,
			disableAttachment: true,
			apps: apps.fetch,
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
		//加载时，还原App初始状态
		this.resetAppList();
		dispatch({ type: 'caseAdd/queryOfficer' });
	}
	/**
	 * 取所有App的包名
	 * @returns 包名数组
	 */
	getAllPackages(): CParseApp[] {
		const { fetch } = apps;
		let selectedApp: CParseApp[] = [];
		fetch.forEach((catetory: ICategory, index: number) => {
			catetory.app_list.forEach((current: IIcon) => {
				selectedApp.push(
					new CParseApp({ m_strID: current.app_id, m_strPktlist: current.packages })
				);
			});
		});
		return selectedApp;
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
		const {
			chooiseApp,
			sdCard,
			hasReport,
			autoParse,
			apps,
			generateBcp,
			attachment
		} = this.state;
		validateFields((err: Error, values: FormValue) => {
			if (helper.isNullOrUndefined(err)) {
				let selectedApp: CParseApp[] = []; //选中的App
				apps.forEach((catetory: ICategory) => {
					catetory.app_list.forEach((current: IIcon) => {
						if (current.select === 1) {
							selectedApp.push(
								new CParseApp({
									m_strID: current.app_id,
									m_strPktlist: current.packages
								})
							);
						}
					});
				});
				if (chooiseApp && selectedApp.length === 0) {
					message.destroy();
					message.info('请选择要解析的App');
				} else {
					let entity = new CCaseInfo();
					entity.m_strCaseName = `${values.currentCaseName.replace(
						/_/g,
						''
					)}_${helper.timestamp()}`;
					entity.m_strCasePath = values.m_strCasePath;
					entity.m_strCheckUnitName = values.checkUnitName;
					entity.chooiseApp = chooiseApp;
					entity.sdCard = sdCard;
					entity.hasReport = hasReport;
					entity.m_bIsAutoParse = autoParse;
					entity.m_Applist = selectedApp;
					entity.generateBcp = generateBcp;
					entity.attachment = attachment;
					entity.officerNo = values.officerNo;
					entity.officerName = this.currentOfficerName;
					entity.securityCaseNo = values.securityCaseNo;
					entity.securityCaseType = values.securityCaseType;
					entity.securityCaseName = values.securityCaseName;
					entity.handleCaseNo = values.handleCaseNo;
					entity.handleCaseType = values.handleCaseType;
					entity.handleCaseName = values.handleCaseName;
                    entity.handleOfficerNo = values.handleOfficerNo;
					this.saveCase(entity);
				}
			}
		});
	};
	/**
	 * 选择AppChange事件
	 */
	chooiseAppChange = (e: CheckboxChangeEvent) => {
		let { checked } = e.target;
		if (!checked) {
			this.resetAppList();
		}
		this.setState({ chooiseApp: checked });
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
	 * 还原AppList组件初始状态
	 */
	resetAppList() {
		let temp = [...this.state.apps];
		for (let i = 0; i < temp.length; i++) {
			temp[i].app_list = temp[i].app_list.map((app) => ({ ...app, select: 0 }));
		}
		this.setState({ apps: temp });
	}
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
					<AddForm
						ref={this.formRef}
						historyUnitNames={this.state.historyUnitNames}
						chooiseApp={this.state.chooiseApp}
						sdCard={this.state.sdCard}
						hasReport={this.state.hasReport}
						autoParse={this.state.autoParse}
						generateBcp={this.state.generateBcp}
						disableGenerateBcp={this.state.disableGenerateBcp}
						attachment={this.state.attachment}
						disableAttachment={this.state.disableAttachment}
						apps={this.state.apps}
						context={this as any}
					/>
				</div>
			</div>
		);
	}
}

export default connect((state: any) => ({ caseAdd: state.caseAdd }))(CaseAdd);
