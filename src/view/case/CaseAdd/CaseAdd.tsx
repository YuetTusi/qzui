import React, { Component, FocusEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, StoreComponent } from '@src/type/model';
import { StoreState } from '@src/model/case/CaseAdd/CaseAdd';
import debounce from 'lodash/debounce';
import Checkbox from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import Title from '@src/components/title/Title';
import AppList from '@src/components/AppList/AppList';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import { apps } from '@src/config/view.config';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { helper } from '@src/utils/helper';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { CClientInfo } from '@src/schema/CClientInfo';
import { caseType } from '@src/schema/CaseType';
import { CaseForm } from './caseForm';
import { CParseApp } from '@src/schema/CParseApp';
import './CaseAdd.less';

interface IProp extends StoreComponent, FormComponentProps {
    caseAdd: StoreState;
}
interface IState {
    apps: Array<ICategory>;   //App列表数据
    autoAnalysis: boolean; //是否自动解析
    isShowAppList: boolean; //是否显示App列表
    isDisableBCP: boolean; //是否禁用BCP
    bcp: boolean; //是否生成BCP
}

let FormCaseAdd = Form.create<FormComponentProps<IProp>>({ name: 'CaseAddForm' })(
    /**
     * 新增案件
     */
    class CaseAdd extends Component<IProp, IState> {
        constructor(props: IProp) {
            super(props);
            this.state = {
                autoAnalysis: false,
                apps: apps.fetch,
                isShowAppList: false,
                isDisableBCP: true,
                bcp: false
            }
            this.saveCase = debounce(this.saveCase, 1200, {
                leading: true,
                trailing: false
            });
        }
        componentWillUnmount() {
            this.resetAppList();
        }
        /**
         * 取所有App的包名
         * @returns 包名数组
         */
        getAllPackages(): CParseApp[] {
            const { fetch } = apps;
            let selectedApp: CParseApp[] = [];
            fetch.forEach((catetory: IObject, index: number) => {
                catetory.app_list.forEach((current: IObject) => {
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
            const { autoAnalysis, bcp, apps } = this.state;
            validateFields((err, values: CaseForm) => {
                if (helper.isNullOrUndefined(err)) {
                    let selectedApp: CParseApp[] = []; //选中的App
                    apps.forEach((catetory: IObject) => {
                        catetory.app_list.forEach((current: IObject) => {
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
                        clientInfoEntity.m_strClientName = values.sendUnit;
                        let entity = new CCaseInfo({
                            m_strCaseName: `${values.currentCaseName.replace(/_/g, '')}_${helper.timestamp()}`,
                            m_bIsAutoParse: autoAnalysis,
                            m_bIsGenerateBCP: bcp,
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
                        console.log(entity);
                        this.saveCase(entity);
                    }
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
                isDisableBCP: !checked,
                bcp: false
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
            this.setState({ bcp: e.target.checked });
        }
        /**
         * 将JSON数据转为Options元素
         * @param data JSON数据
         */
        getOptions = (data: Array<IObject>): JSX.Element[] => {
            const { Option } = Select;
            return data.map<JSX.Element>((item: IObject) =>
                <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
        }
        /**
         * 当案件文本框失去焦点
         * #用户手输入案件
         */
        currentCaseNameBlur = (e: FocusEvent<HTMLInputElement>) => {
            const { setFieldsValue } = this.props.form;
            // let val = getFieldValue('m_strBCPCaseName');
            setFieldsValue({ m_strBCPCaseName: e.currentTarget.value });
        }
        renderForm(): JSX.Element {
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 },
            };
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            return <Form {...formItemLayout}>
                <Item
                    label="案件名称">
                    {getFieldDecorator('currentCaseName', {
                        rules: [{ required: true, message: '请填写案件名称' }]
                    })(<Input
                        onBlur={this.currentCaseNameBlur}
                        prefix={<Icon type="profile" />}
                        maxLength={100} />)}

                </Item>
                <Item label="送检目的单位">
                    {getFieldDecorator('sendUnit')(<Input
                        prefix={<Icon type="bank" />}
                        maxLength={100} />)}

                </Item>
                <Item label="自动解析">
                    <Checkbox onChange={this.autoAnalysisChange} checked={this.state.autoAnalysis} />
                    <Item label="生成BCP" style={{ display: 'inline-block', width: '60%' }} labelCol={{ span: 10 }}>
                        <Checkbox disabled={this.state.isDisableBCP} onChange={this.bcpChange} checked={this.state.bcp} />
                    </Item>
                </Item>
                <div className="bcp-list">
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
                        onOk={() => this.saveCaseClick()}>
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