import React, { Component, FocusEvent, MouseEvent } from 'react';
import { OpenDialogReturnValue, remote } from 'electron';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent } from '@src/type/model';
import { StoreState } from '@src/model/case/CaseAdd/CaseAdd';
import debounce from 'lodash/debounce';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import AutoComplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Select from 'antd/lib/select';
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
import { caseType } from '@src/schema/CaseType';
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
        constructor(props: Prop) {
            super(props);
            this.state = {
                autoAnalysis: false,
                apps: apps.fetch,
                isShowAppList: false,
                isDisableBCP: true,
                isShowBCPInput: false,
                isDisableAttachment: true,
                bcp: false,
                attachment: false,
                historyUnitNames: []
            };
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
            const { autoAnalysis, bcp, apps, attachment } = this.state;
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
                    if (autoAnalysis && selectedApp.length === 0) {
                        message.destroy();
                        message.info('请选择要解析的App');
                    } else {
                        let clientInfoEntity = new CClientInfo();
                        let entity = new CCaseInfo({
                            m_strCaseName: `${values.currentCaseName.replace(/_/g, '')}_${helper.timestamp()}`,
                            m_strCasePath: values.m_strCasePath,
                            m_strCheckUnitName: values.checkUnitName,
                            m_strDstCheckUnitName: values.sendUnit,
                            m_bIsAutoParse: autoAnalysis,
                            m_bIsGenerateBCP: bcp,
                            m_bIsAttachment: attachment,
                            m_Clientinfo: clientInfoEntity,
                            //?如果"是"自动解析，那么保存用户选的包名;否则保存全部App包名
                            m_Applist: autoAnalysis ? selectedApp : this.getAllPackages(),
                            m_strCaseNo: values.m_strCaseNo,
                            m_strCaseType: values.m_strCaseType,
                            m_strBCPCaseName: values.m_strBCPCaseName,
                            m_strGaCaseName: values.m_strGaCaseName,
                            m_strGaCaseType: values.m_strGaCaseType,
                            m_strGaCaseNo: values.m_strGaCaseNo,
                            m_strGaCasePersonNum: values.m_strGaCasePersonNum
                        });
                        this.saveCase(entity);
                    }
                } else {
                    console.log(err);
                }
            });
        }
        /**
         * 自动解析Change事件
         */
        autoAnalysisChange = (e: CheckboxChangeEvent) => {
            let { checked } = e.target;

            if (!checked) {
                this.resetAppList();
            }

            this.setState({
                autoAnalysis: checked,
                isShowAppList: checked,
                isShowBCPInput: false,
                isDisableBCP: !checked,
                isDisableAttachment: true,
                bcp: false,
                attachment: false
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
         * 生成BCP Change事件
         */
        bcpChange = (e: CheckboxChangeEvent) => {
            const { checked } = e.target;
            this.setState({
                bcp: checked,
                isShowBCPInput: checked,
                isDisableAttachment: !checked,
                attachment: false
            });
        }
        /**
         * 是否带有附件Change
         */
        attachmentChange = (e: CheckboxChangeEvent) => {
            this.setState({ attachment: e.target.checked });
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
                <Item label="检验单位">
                    {getFieldDecorator('checkUnitName', {
                        rules: [{ required: true, message: '请填写检验单位' }],
                        initialValue: helper.isNullOrUndefined(historyUnitNames) || historyUnitNames.length === 0 ? '' : historyUnitNames[0]
                    })(<AutoComplete dataSource={helper.isNullOrUndefined(historyUnitNames)
                        ? []
                        : this.state.historyUnitNames.reduce((total: string[], current: string, index: number) => {
                            if (index < 10) {
                                total.push(current);
                            }
                            return total;
                        }, [])} />)}
                </Item>
                <Item label="送检单位">
                    {getFieldDecorator('sendUnit')(<Input
                        maxLength={100} />)}
                </Item>
                <div className="checkbox-panel">
                    <div className="ant-col ant-col-4 ant-form-item-label">
                        <label>自动解析</label>
                    </div>
                    <div className="ant-col ant-col-18 ant-form-item-control-wrapper">
                        <div className="inner">
                            <Checkbox onChange={this.autoAnalysisChange} checked={this.state.autoAnalysis} />
                            <span>生成BCP：</span>
                            <Checkbox disabled={this.state.isDisableBCP} onChange={this.bcpChange} checked={this.state.bcp} />
                            <span>包含附件：</span>
                            <Checkbox disabled={this.state.isDisableAttachment} onChange={this.attachmentChange} checked={this.state.attachment} />
                        </div>
                    </div>
                </div>
                <div className="bcp-list" style={{ display: this.state.isShowBCPInput ? 'block' : 'none' }}>
                    <div className="bcp-list-bar">
                        <Icon type="appstore" rotate={45} />
                        <span>BCP 信息录入</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="网安部门案件编号"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('m_strCaseNo', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写网安部门案件编号'
                                    }
                                ]
                            })(<Input />)}
                        </Item>
                        <Item
                            label="网安部门案件类别"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('m_strCaseType', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写网安部门案件类别'
                                    }
                                ],
                                initialValue: '100'
                            })(<Select>
                                {this.getOptions(caseType)}
                            </Select>)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="网安部门案件名称"
                            style={{ flex: 1 }}>
                            {getFieldDecorator('m_strBCPCaseName', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写网安部门案件名称'
                                    }
                                ]
                            })(<Input />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="执法办案系统案件编号"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('m_strGaCaseNo', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写执法办案系统案件编号'
                                    }
                                ]
                            })(<Input />)}
                        </Item>
                        <Item
                            label="执法办案系统案件类别"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('m_strGaCaseType', {
                                rules: [
                                    { required: false }
                                ]
                            })(<Input />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="执法办案系统案件名称"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('m_strGaCaseName', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写执法办案系统案件名称'
                                    }
                                ]
                            })(<Input />)}
                        </Item>
                        <Item
                            label="执法办案人员编号"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('m_strGaCasePersonNum', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写执法办案人员编号'
                                    }
                                ]
                            })(<Input />)}
                        </Item>
                    </div>
                </div>
                <Item className="app-list-item">
                    <div className="app-list-panel" style={{ display: this.state.isShowAppList ? 'block' : 'none' }}>
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