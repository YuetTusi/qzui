import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import { StoreComponent, NVObject } from '@src/type/model';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import AutoComplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import AppList from '@src/components/AppList/AppList';
import { apps } from '@src/config/view.config';
import Title from '@src/components/title/Title';
import { helper } from '@src/utils/helper';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import { caseType } from '@src/schema/CaseType';
import { StoreState } from '@src/model/case/CaseEdit/CaseEdit';
import { CParseApp } from '@src/schema/CParseApp';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CaseForm } from './CaseForm';
import localStore from '@src/utils/localStore';
import './CaseEdit.less';

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库对象
     */
    caseEdit: StoreState;
}

interface State {
    historyUnitNames: string[];      //localStore中存储的单位名
}

//CCaseInfo GetSpecCaseInfo(std::string strCasePath) 接口
let ExtendCaseEdit = Form.create<Prop>({ name: 'CaseEditForm' })(
    /**
     * 案件编辑页
     */
    class CaseEdit extends Component<Prop, State> {
        /**
         * 当前编辑案件的时间戳
         */
        timetick: string;
        constructor(props: any) {
            super(props);
            this.timetick = '';
            this.state = {
                historyUnitNames: []
            };
            this.saveCase = debounce(this.saveCase, 1200, {
                leading: true,
                trailing: false
            });
        }
        componentDidMount() {
            const { match } = this.props;
            const { dispatch } = this.props;
            const names: string[] = localStore.get('HISTORY_UNITNAME');
            this.setState({ historyUnitNames: names });
            dispatch({ type: 'caseEdit/queryCaseByPath', payload: match.params.path });
        }
        componentWillUnmount() {
            const { dispatch } = this.props;
            dispatch({ type: 'caseEdit/setData', payload: { apps: apps.fetch } });
        }
        /**
         * 自动解析Change事件
         */
        autoAnalysisChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            if (!checked) {
                this.resetAppList();
            }
            dispatch({ type: 'caseEdit/setAutoAnalysis', payload: checked });
            if (!checked) {
                dispatch({ type: 'caseEdit/setGenerateBCP', payload: false });
                dispatch({ type: 'caseEdit/setBcpInputEmpty' });//把BCP相关字段清空
            }
        }
        /**
         * 生成BCP Change事件
         */
        bcpChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            if (!checked) {
                //#如果不勾选BCP，把BCP相关字段清空（还原为初始值）
                dispatch({ type: 'caseEdit/setBcpInputEmpty' });
            }
            dispatch({ type: 'caseEdit/setGenerateBCP', payload: checked });
        }
        /**
         * 附件Change
         */
        attachmentChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            dispatch({ type: 'caseEdit/setAttachment', payload: checked });
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
        getOptions = (data: Array<NVObject>): JSX.Element[] => {
            const { Option } = Select;
            return data.map<JSX.Element>((item: NVObject) =>
                <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
        }
        /**
         * 选中的app数据
         */
        selectAppHandle = (apps: ICategory[]) => { }
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
            const { m_bIsAutoParse, m_bIsGenerateBCP, m_bIsAttachment, apps } = this.props.caseEdit.data;
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
                    if (m_bIsAutoParse && selectedApp.length === 0) {
                        message.destroy();
                        message.info('请选择要解析的App');
                    } else {
                        let entity = new CCaseInfo({
                            m_strCaseName: `${values.currentCaseName}_${this.timetick}`,
                            m_strCheckUnitName: values.m_strCheckUnitName,
                            m_bIsAutoParse,
                            m_bIsGenerateBCP,
                            m_bIsAttachment,
                            m_strDstCheckUnitName: values.m_strDstCheckUnitName,
                            //NOTE:如果"是"自动解析，那么保存用户选的包名;否则保存全部App包名
                            m_Applist: m_bIsAutoParse ? selectedApp : this.getAllPackages(),
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
                <Item
                    label="案件名称">
                    {getFieldDecorator('currentCaseName', {
                        rules: [{ required: true, message: '请填写案件名称' }],
                        initialValue: this.getCaseNameFromPath(data.m_strCaseName)
                    })(<Input
                        prefix={<Icon type="profile" />}
                        maxLength={100}
                        disabled={true} />)}
                </Item>
                <Item label="检验单位">
                    {getFieldDecorator('m_strCheckUnitName', {
                        rules: [{ required: true, message: '请填写检验单位' }],
                        initialValue: data.m_strCheckUnitName
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
                    {getFieldDecorator('m_strDstCheckUnitName', {
                        initialValue: data.m_strDstCheckUnitName
                    })(<Input
                        prefix={<Icon type="bank" />}
                        maxLength={100} />)}

                </Item>
                <div className="checkbox-panel">
                    <span>
                        <label>自动解析: </label>
                        <Checkbox onChange={this.autoAnalysisChange} checked={data.m_bIsAutoParse} />
                    </span>
                    <span>
                        <label>生成BCP: </label>
                        <Checkbox disabled={!data?.m_bIsAutoParse} onChange={this.bcpChange} checked={data?.m_bIsGenerateBCP} />
                    </span>
                    <span>
                        <label>包含附件: </label>
                        <Checkbox disabled={!data?.m_bIsGenerateBCP} onChange={this.attachmentChange} checked={data?.m_bIsAttachment} />
                    </span>
                </div>
                <div className="bcp-list" style={{ display: data?.m_bIsGenerateBCP ? 'block' : 'none' }}>
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
                                ],
                                initialValue: data.m_strCaseNo
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
                                initialValue: helper.isNullOrUndefined(data.m_strCaseType) ? '100' : data.m_strCaseType
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
                                ],
                                initialValue: data.m_strBCPCaseName
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
                                ],
                                initialValue: data.m_strGaCaseNo
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
                                ],
                                initialValue: data.m_strGaCaseType
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
                                ],
                                initialValue: data.m_strGaCaseName
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
                                ],
                                initialValue: data.m_strGaCasePersonNum
                            })(<Input />)}
                        </Item>
                    </div>
                </div>
                <Item className="app-list-item">
                    <div className="app-list-panel" style={{ display: data.m_bIsAutoParse ? 'block' : 'none' }}>
                        <AppList apps={data.apps} selectHandle={this.selectAppHandle} />
                    </div>
                </Item>
            </Form>;
        }
        getCaseNameFromPath(path: string) {
            if (helper.isNullOrUndefined(path)) {
                return helper.EMPTY_STRING;
            }
            let pos = path.lastIndexOf('\\');
            let [caseName, timetick] = path.substring(pos + 1).split('_');
            this.timetick = timetick;
            return caseName;
        }
        render(): ReactElement {
            const { params } = this.props.match;
            return <div className="case-edit-root">
                <div className="box-sp">
                    <Title returnText="返回" okText="确定"
                        onReturn={() => this.props.dispatch(routerRedux.push('/case'))}
                        onOk={() => this.saveCaseClick()}>
                        编辑案件 - <strong>{this.getCaseNameFromPath(params.path)}</strong>
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