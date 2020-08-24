import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import Empty from 'antd/lib/empty';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import AutoComplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import apps from '@src/config/app.yaml';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import AppList from '@src/components/AppList/AppList';
import Title from '@src/components/title/Title';
import { Prop, State } from './ComponentType';
import { helper } from '@src/utils/helper';
import { caseType } from '@src/schema/CaseType';
import { CParseApp } from '@src/schema/CParseApp';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CaseForm } from './CaseForm';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { LeftUnderline } from '@src/utils/regex';
import './CaseEdit.less';
import { data } from 'jquery';

const { Option } = Select;

let ExtendCaseEdit = Form.create<Prop>({ name: 'CaseEditForm' })(
    /**
     * 案件编辑页
     */
    class CaseEdit extends Component<Prop, State> {
        /**
         * 寄存当前采集人员姓名
         */
        currentOfficerName: string;

        constructor(props: any) {
            super(props);
            this.currentOfficerName = '';
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
            dispatch({ type: 'caseEdit/setData', payload: { apps: apps.fetch } });
        }
        /**
         * 绑定采集人员Options
         */
        bindOfficerOptions = () => {
            const { officerList } = this.props.caseEdit;
            return officerList.map((opt) => {
                return <Option
                    value={opt.no}
                    data-name={opt.name}>
                    {`${opt.name}（${opt.no}）`}
                </Option>;
            });
        }
        /**
         * 采集人员初始化值
         * @param officerNo 采集人员编号
         */
        getOfficerInitVal = (officerNo: string) => {
            const { officerList } = this.props.caseEdit;
            if (officerList.find(i => i.no === officerNo)) {
                return officerNo;
            } else {
                return undefined;
            }
        }
        /**
         * 选择AppChange
         */
        chooiseAppChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            if (!checked) {
                this.resetAppList();
            }
            dispatch({ type: 'caseEdit/setChooiseApp', payload: checked });
        }
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
        }
        /**
         * 生成BCPChange事件
         */
        generateBcpChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            dispatch({ type: 'caseEdit/setGenerateBcp', payload: checked });
            if (!checked) {
                dispatch({ type: 'caseEdit/setAttachment', payload: false });
            }
        }
        /**
         * 是否有附件Change事件
         */
        attachmentChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            dispatch({ type: 'caseEdit/setAttachment', payload: checked });
        }
        officerChange = (value: string, option: React.ReactElement<any> | React.ReactElement<any>[]) => {
            this.currentOfficerName = (option as JSX.Element).props['data-name'];
        }
        /**
         * 还原AppList组件初始状态
         */
        resetAppList() {
            let { apps } = this.props.caseEdit.data;
            let temp = apps;
            for (let i = 0; i < temp.length; i++) {
                temp[i].app_list = temp[i].app_list.map((app: IIcon) => ({ ...app, select: 0 }));
            }
        }
        /**
         * 将JSON数据转为Options元素
         * @param data JSON数据
         */
        getOptions = (data: Record<string, string | number>[]): JSX.Element[] => {
            const { Option } = Select;
            return data.map<JSX.Element>((item: Record<string, string | number>) =>
                <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
        }
        /**
         * 取所有App的包名
         * @returns 包名数组
         */
        getAllPackages(): CParseApp[] {
            const { apps } = this.props.caseEdit.data;
            let selectedApp: CParseApp[] = [];
            apps.forEach((catetory: ICategory, index: number) => {
                catetory.app_list.forEach((current: IIcon) => {
                    selectedApp.push(new CParseApp({ m_strID: current.app_id, m_strPktlist: current.packages }));
                });
            });
            return selectedApp;
        }
        /**
         * 保存案件Click事件 
         */
        saveCaseClick = () => {
            const { validateFields } = this.props.form;
            const {
                m_bIsAutoParse, apps, generateBcp,
                attachment, m_strCaseName, chooiseApp,
                officerName
            } = this.props.caseEdit.data;
            validateFields((err, values: CaseForm) => {
                if (helper.isNullOrUndefined(err)) {
                    let selectedApp: CParseApp[] = []; //选中的App
                    apps.forEach((catetory: ICategory) => {
                        catetory.app_list.forEach((current: IIcon) => {
                            if (current.select === 1) {
                                selectedApp.push(new CParseApp({
                                    m_strID: current.app_id,
                                    m_strPktlist: current.packages
                                }));
                            }
                        })
                    });
                    if (chooiseApp && selectedApp.length === 0) {
                        message.destroy();
                        message.info('请选择要解析的App');
                    } else {
                        let entity = new CCaseInfo();
                        entity.m_strCaseName = m_strCaseName;
                        entity.m_strCasePath = values.m_strCasePath;
                        entity.m_strCheckUnitName = values.m_strCheckUnitName;
                        entity.chooiseApp = chooiseApp;
                        entity.m_bIsAutoParse = m_bIsAutoParse;
                        entity.generateBcp = generateBcp;
                        entity.attachment = attachment;
                        //NOTE:如果"是"自动解析，那么保存用户选的包名;否则保存全部App包名
                        entity.m_Applist = selectedApp;
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
                }
            });
        }
        /**
         * 保存案件
         */
        saveCase = (data: CCaseInfo) => {
            const { dispatch } = this.props;
            dispatch({ type: 'caseEdit/saveCase', payload: data });
        }
        getCaseName(caseName?: string) {
            if (helper.isNullOrUndefined(caseName)) {
                return '';
            } else {
                return caseName!.match(LeftUnderline)![0]
            }
        }
        renderForm(): JSX.Element {
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 },
            };
            const { Item } = Form;
            const { data } = this.props.caseEdit;
            const { getFieldDecorator } = this.props.form;
            const { historyUnitNames } = this.state;
            return <Form {...formItemLayout}>
                <Row>
                    <Col span={24}>
                        <Item
                            label="案件名称">
                            {getFieldDecorator('currentCaseName', {
                                rules: [{ required: true, message: '请填写案件名称' }],
                                initialValue: this.getCaseName(data.m_strCaseName)
                            })(<Input
                                prefix={<Icon type="profile" />}
                                maxLength={100}
                                disabled={true} />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Item label="存储路径">
                            {getFieldDecorator('m_strCasePath', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请选择存储路径'
                                    }
                                ],
                                initialValue: data.m_strCasePath
                            })(<Input
                                addonAfter={<Icon type="ellipsis" />}
                                disabled={true}
                                readOnly={true} />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Item label="检验单位">
                            {getFieldDecorator('m_strCheckUnitName', {
                                rules: [{ required: true, message: '请填写检验单位' }],
                                initialValue: data.m_strCheckUnitName
                            })(<AutoComplete dataSource={helper.isNullOrUndefined(historyUnitNames)
                                ? []
                                : this.state.historyUnitNames.reduce((total: string[], current: string, index: number) => {
                                    if (index < 10 && !helper.isNullOrUndefinedOrEmptyString(current)) {
                                        total.push(current);
                                    }
                                    return total;
                                }, [])} />)}
                        </Item>
                    </Col>
                </Row>
                <div className="checkbox-panel">
                    <div className="ant-col ant-col-4 ant-form-item-label">
                        <label>选择APP</label>
                    </div>
                    <div className="ant-col ant-col-18 ant-form-item-control-wrapper">
                        <div className="inner">
                            <Checkbox onChange={this.chooiseAppChange} checked={data.chooiseApp} />
                            <span>自动解析：</span>
                            <Checkbox onChange={this.autoParseChange} checked={data.m_bIsAutoParse} />
                            <span>生成BCP：</span>
                            <Checkbox
                                onChange={this.generateBcpChange}
                                disabled={!data.m_bIsAutoParse}
                                checked={data.generateBcp} />
                            <span>包含附件：</span>
                            <Checkbox
                                onChange={this.attachmentChange}
                                checked={data.attachment}
                                disabled={!data.m_bIsAutoParse || !data.generateBcp} />
                        </div>
                    </div>
                </div>
                <div className="bcp-list" style={{ display: data.generateBcp ? 'block' : 'none' }}>
                    <div className="bcp-list-bar">
                        <Icon type="appstore" rotate={45} />
                        <span>BCP信息</span>
                    </div>
                    <Row>
                        <Col span={12}>
                            <Item
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                label="采集人员">
                                {getFieldDecorator('officerNo', {
                                    rules: [
                                        {
                                            required: data.generateBcp,
                                            message: '请选择采集人员'
                                        }
                                    ],
                                    initialValue: this.getOfficerInitVal(data.officerNo)
                                })(<Select
                                    onChange={this.officerChange}
                                    notFoundContent={<Empty description="暂无采集人员" image={Empty.PRESENTED_IMAGE_SIMPLE} />}>
                                    {this.bindOfficerOptions()}
                                </Select>)}
                            </Item>
                        </Col>
                        <Col span={12} />
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="网安部门案件编号"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}>
                                {getFieldDecorator('securityCaseNo', {
                                    initialValue: data.securityCaseNo
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="网安部门案件类别"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}>
                                {getFieldDecorator('securityCaseType', {
                                    initialValue: data.securityCaseType
                                })(<Select>
                                    {this.getOptions(caseType)}
                                </Select>)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Item label="网安部门案件名称" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                                {getFieldDecorator('securityCaseName', {
                                    initialValue: data.securityCaseName
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="执法办案系统案件编号"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}>
                                {getFieldDecorator('handleCaseNo', {
                                    initialValue: data.handleCaseNo
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="执法办案系统案件类别"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}>
                                {getFieldDecorator('handleCaseType', {
                                    initialValue: data.handleCaseType
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Item label="执法办案系统案件名称"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}>
                                {getFieldDecorator('handleCaseName', {
                                    initialValue: data.handleCaseName
                                })(<Input />)}
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item label="执法办案人员编号"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 14 }}>
                                {getFieldDecorator('handleOfficerNo', {
                                    initialValue: data.handleOfficerNo
                                })(<Input />)}
                            </Item>
                        </Col>
                    </Row>
                </div>
                <Item className="app-list-item">
                    <div className="app-list-panel" style={{ display: data.chooiseApp ? 'block' : 'none' }}>
                        <AppList apps={data.apps} />
                    </div>
                </Item>
            </Form>;
        }
        render(): JSX.Element {
            const { data } = this.props.caseEdit;
            return <div className="case-edit-root">
                <div className="box-sp">
                    <Title returnText="返回" okText="确定"
                        onReturn={() => this.props.dispatch(routerRedux.push('/case'))}
                        onOk={() => this.saveCaseClick()}>
                        编辑案件 - <strong title={data._id}>{this.getCaseName(data.m_strCaseName)}</strong>
                    </Title>
                </div>
                <div className="form-panel">
                    {this.renderForm()}
                </div>
            </div>
        }
    }
);

export default connect((state: any) => ({ 'caseEdit': state.caseEdit }))(ExtendCaseEdit);