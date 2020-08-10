import React, { Component, MouseEvent } from 'react';
import { OpenDialogReturnValue, remote } from 'electron';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import AutoComplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import AppList from '@src/components/AppList/AppList';
import apps from '@src/config/app.yaml';
import Title from '@src/components/title/Title';
import { Prop, State } from './ComponentType';
import { helper } from '@src/utils/helper';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import { caseType } from '@src/schema/CaseType';
import { CParseApp } from '@src/schema/CParseApp';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CaseForm } from './CaseForm';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { LeftUnderline } from '@src/utils/regex';
import './CaseEdit.less';

//CCaseInfo GetSpecCaseInfo(std::string strCasePath) 接口
let ExtendCaseEdit = Form.create<Prop>({ name: 'CaseEditForm' })(
    /**
     * 案件编辑页
     */
    class CaseEdit extends Component<Prop, State> {

        historyCheckerNames: string[];
        historyCheckerNo: string[];

        constructor(props: any) {
            super(props);
            this.state = {
                historyUnitNames: [],
                titleCaseName: ''
            };
            this.saveCase = debounce(this.saveCase, 1200, {
                leading: true,
                trailing: false
            });
            this.historyCheckerNames = UserHistory.get(HistoryKeys.HISTORY_CHECKERNAME);
            this.historyCheckerNo = UserHistory.get(HistoryKeys.HISTORY_CHECKERNO);
        }
        componentDidMount() {
            const { match } = this.props;
            const { dispatch } = this.props;
            const names: string[] = UserHistory.get(HistoryKeys.HISTORY_UNITNAME);
            this.setState({ historyUnitNames: names });
            dispatch({ type: 'caseEdit/queryCaseById', payload: match.params.id });
        }
        componentWillUnmount() {
            const { dispatch } = this.props;
            dispatch({ type: 'caseEdit/setData', payload: { apps: apps.fetch } });
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
         * 选择案件路径Handle
         */
        selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
            const { setFieldsValue } = this.props.form;
            remote.dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then((val: OpenDialogReturnValue) => {
                if (val.filePaths && val.filePaths.length > 0) {
                    setFieldsValue({ m_strCasePath: val.filePaths[0] });
                }
            });
        }
        /**
         * 保存案件Click事件 
         */
        saveCaseClick = () => {
            const { validateFields } = this.props.form;
            const {
                m_bIsAutoParse, apps,
                m_strCaseName, chooiseApp
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
                        let entity = new CCaseInfo({
                            // m_strCaseName: `${values.currentCaseName}_${this.timetick}`,
                            m_strCaseName,
                            m_strCasePath: values.m_strCasePath,
                            checkerName: values.checkerName,
                            checkerNo: values.checkerNo,
                            m_strCheckUnitName: values.m_strCheckUnitName,
                            chooiseApp,
                            m_bIsAutoParse,
                            m_strDstCheckUnitName: values.m_strDstCheckUnitName,
                            //NOTE:如果"是"自动解析，那么保存用户选的包名;否则保存全部App包名
                            m_Applist: selectedApp
                        });
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
                                readOnly={true}
                                onClick={this.selectDirHandle} />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="检验员" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                            {getFieldDecorator('checkerName', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请填写检验员'
                                    }
                                ],
                                initialValue: data.checkerName
                            })(<AutoComplete dataSource={this.historyCheckerNames.reduce((total: string[], current: string, index: number) => {
                                if (index < 10 && !helper.isNullOrUndefinedOrEmptyString(current)) {
                                    total.push(current);
                                }
                                return total;
                            }, [])} />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="检验员编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                            {getFieldDecorator('checkerNo', {
                                initialValue: data.checkerNo
                            })(<AutoComplete dataSource={this.historyCheckerNo.reduce((total: string[], current: string, index: number) => {
                                if (index < 10 && !helper.isNullOrUndefinedOrEmptyString(current)) {
                                    total.push(current);
                                }
                                return total;
                            }, [])} />)}
                        </Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Item label="检验单位" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
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
                    <Col span={12}>
                        <Item label="送检单位" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                            {getFieldDecorator('m_strDstCheckUnitName', {
                                initialValue: data.m_strDstCheckUnitName
                            })(<Input
                                maxLength={100} />)}

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
                        </div>
                    </div>
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