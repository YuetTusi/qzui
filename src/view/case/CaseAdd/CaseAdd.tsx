import React, { Component, FocusEvent, MouseEvent } from 'react';
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
import Form, { FormComponentProps } from 'antd/lib/form';
import Select from 'antd/lib/select';
import Tooltip from 'antd/lib/tooltip';
import message from 'antd/lib/message';
import Title from '@src/components/title/Title';
import AppList from '@src/components/AppList/AppList';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import { Prop, State } from './componentType';
import { helper } from '@src/utils/helper';
import Db from '@utils/db';
import { TableName } from '@src/schema/db/TableName';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { CClientInfo } from '@src/schema/CClientInfo';
import { CaseForm } from './caseForm';
import { CParseApp } from '@src/schema/CParseApp';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import apps from '@src/config/app.yaml';
import { LeftUnderline } from '@utils/regex';
import './CaseAdd.less';

let FormCaseAdd = Form.create<FormComponentProps<Prop>>({ name: 'CaseAddForm' })(
    /**
     * 新增案件
     */
    class CaseAdd extends Component<Prop, State> {

        historyCheckerNames: string[];
        historyCheckerNo: string[];

        constructor(props: Prop) {
            super(props);
            this.state = {
                chooiseApp: false,
                autoParse: false,
                apps: apps.fetch,
                historyUnitNames: []
            };
            this.historyCheckerNames = UserHistory.get(HistoryKeys.HISTORY_CHECKERNAME);
            this.historyCheckerNo = UserHistory.get(HistoryKeys.HISTORY_CHECKERNO);
            this.saveCase = debounce(this.saveCase, 1200, {
                leading: true,
                trailing: false
            });
            this.validCaseNameExists = debounce(this.validCaseNameExists, 200);
        }
        componentDidMount() {

            this.setState({ historyUnitNames: UserHistory.get(HistoryKeys.HISTORY_UNITNAME) });
            //加载时，还原App初始状态
            this.resetAppList();
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
                    selectedApp.push(new CParseApp({ m_strID: current.app_id, m_strPktlist: current.packages }));
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
            const { validateFields } = this.props.form;
            const { chooiseApp, autoParse, apps } = this.state;
            validateFields((err, values: CaseForm) => {
                if (helper.isNullOrUndefined(err)) {
                    let selectedApp: CParseApp[] = []; //选中的App
                    apps.forEach((catetory: ICategory) => {
                        catetory.app_list.forEach((current: IIcon) => {
                            if (current.select === 1) {
                                selectedApp.push(new CParseApp({ m_strID: current.app_id, m_strPktlist: current.packages }));
                            }
                        })
                    });
                    if (chooiseApp && selectedApp.length === 0) {
                        message.destroy();
                        message.info('请选择要解析的App');
                    } else {
                        let entity = new CCaseInfo({
                            m_strCaseName: `${values.currentCaseName.replace(/_/g, '')}_${helper.timestamp()}`,
                            m_strCasePath: values.m_strCasePath,
                            checkerName: values.checkerName,
                            checkerNo: values.checkerNo,
                            m_strCheckUnitName: values.checkUnitName,
                            m_strDstCheckUnitName: values.sendUnit,
                            chooiseApp,
                            m_bIsAutoParse: autoParse,
                            m_Applist: selectedApp
                        });
                        this.saveCase(entity);
                    }
                } else {
                    console.log(err);
                }
            });
        }
        /**
         * 选择AppChange事件
         */
        chooiseAppChange = (e: CheckboxChangeEvent) => {
            let { checked } = e.target;

            if (!checked) {
                this.resetAppList();
            }
            this.setState({ chooiseApp: checked });
        }
        /**
         * 自动解析Change事件
         */
        autoParseChange = (e: CheckboxChangeEvent) => {
            let { checked } = e.target;
            this.setState({
                autoParse: checked
            });
        }
        /**
         * 还原AppList组件初始状态
         */
        resetAppList() {
            let temp = [...this.state.apps];
            for (let i = 0; i < temp.length; i++) {
                temp[i].app_list = temp[i].app_list.map(app => ({ ...app, select: 0 }));
            }
            this.setState({ apps: temp });
        }
        /**
         * 将JSON数据转为Options元素
         * @param data JSON数据
         */
        getOptions = (data: Record<string, any>): JSX.Element[] => {
            const { Option } = Select;
            return data.map((item: Record<string, any>) =>
                <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
        }
        /**
         * 当案件文本框失去焦点
         * #用户输入案件名称后，自动赋值到`网安部门案件名称`中
         */
        currentCaseNameBlur = (e: FocusEvent<HTMLInputElement>) => {
            const { setFieldsValue } = this.props.form;
            setFieldsValue({ m_strBCPCaseName: e.currentTarget.value });
        }
        /**
         * 验证案件重名
         */
        validCaseNameExists(rule: any, value: string, callback: any) {
            const db = new Db<CCaseInfo>(TableName.Case);
            db.find(null).then((result: CCaseInfo[]) => {
                let exist = result.find(item => item.m_strCaseName.match(LeftUnderline)![0] === value) !== undefined;
                if (exist) {
                    callback(new Error('案件名称已存在'));
                } else {
                    callback();
                }
            }).catch((err) => {
                callback(err);
            });
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
        renderForm(): JSX.Element {
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 },
            };
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            const { historyUnitNames } = this.state;
            return <Form {...formItemLayout}>
                <Row>
                    <Col span={24}>
                        <Item
                            label="案件名称">
                            {getFieldDecorator('currentCaseName', {
                                rules: [
                                    { required: true, message: '请填写案件名称' },
                                    { validator: this.validCaseNameExists, message: '案件名称已存在' }
                                ],
                            })(<Input
                                onBlur={this.currentCaseNameBlur}
                                maxLength={100} />)}

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
                                ]
                            })(<Input
                                addonAfter={<Icon type="ellipsis" onClick={this.selectDirHandle} />}
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
                                ]
                            })(<AutoComplete dataSource={this.historyCheckerNames.reduce((total: string[], current: string, index: number) => {
                                if (index < 10 && current !== null) {
                                    total.push(current);
                                }
                                return total;
                            }, [])} />)}
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label="检验员编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                            {getFieldDecorator('checkerNo')(<AutoComplete dataSource={this.historyCheckerNo.reduce((total: string[], current: string, index: number) => {
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
                            {getFieldDecorator('checkUnitName', {
                                rules: [{ required: true, message: '请填写检验单位' }],
                                initialValue: helper.isNullOrUndefined(historyUnitNames) || historyUnitNames.length === 0 ? '' : historyUnitNames[0]
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
                            {getFieldDecorator('sendUnit')(<Input
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
                            <Tooltip title="手动选择采集的应用">
                                <Checkbox onChange={this.chooiseAppChange} checked={this.state.chooiseApp} />
                            </Tooltip>
                            <span>自动解析：</span>
                            <Tooltip title="勾选后, 取证完成会自动解析应用数据">
                                <Checkbox onChange={this.autoParseChange} checked={this.state.autoParse} />
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <Item className="app-list-item">
                    <div className="app-list-panel" style={{ display: this.state.chooiseApp ? 'block' : 'none' }}>
                        <AppList apps={this.state.apps} />
                    </div>
                </Item>
            </Form>;
        }
        render(): JSX.Element {
            return <div className="case-add-panel">
                <div className="box-sp">
                    <Title returnText="返回" okText="确定"
                        onReturn={() => this.props.dispatch(routerRedux.push('/case'))}
                        onOk={() => { this.saveCaseClick(); }}>
                        新增案件
                    </Title>
                </div>

                <div className="form-panel">
                    {this.renderForm()}
                </div>
            </div>
        }
    });

export default connect((state: any) => ({ caseAdd: state.caseAdd }))(FormCaseAdd);