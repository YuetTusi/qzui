import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent, NVObject } from '@src/type/model';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form, { FormComponentProps } from 'antd/lib/form';
import Select from 'antd/lib/select';
import AppList from '@src/components/AppList/AppList';
import Title from '@src/components/title/Title';
import { helper } from '@src/utils/helper';
import { ICategory } from '@src/components/AppList/IApps';
import { apps } from '@src/config/view.config';
import { caseType } from '@src/schema/CaseType';
import { StoreState, ExtendCaseInfo } from '@src/model/case/CaseEdit/CaseEdit';
import './CaseEdit.less';

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库对象
     */
    caseEdit: StoreState;
}

interface State {
    apps: Array<ICategory>;   //App列表数据
}

//CCaseInfo GetSpecCaseInfo(std::string strCasePath) 接口
let ExtendCaseEdit = Form.create<Prop>({ name: 'CaseEditForm' })(
    /**
     * 案件编辑页
     */
    class CaseEdit extends Component<Prop, State> {
        constructor(props: any) {
            super(props);
            this.state = {
                apps: apps.fetch
            }
        }
        componentDidMount() {
            const { match } = this.props;
            const { dispatch } = this.props;
            dispatch({ type: 'caseEdit/queryCaseByPath', payload: match.params.path });
        }
        /**
         * 自动解析Change事件
         */
        autoAnalysisChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            dispatch({ type: 'caseEdit/setAutoAnalysis', payload: checked });
            if (!checked) {
                dispatch({ type: 'caseEdit/setGenerateBCP', payload: false });
            }


            // if (!checked) {
            //     this.resetAppList();
            // }


            // this.setState({
            //     autoAnalysis: checked,
            //     isShowAppList: checked,
            //     isDisableBCP: !checked,
            //     bcp: false
            // });
        }
        /**
         * 生成BCP Change事件
         */
        bcpChange = (e: CheckboxChangeEvent) => {
            const { dispatch } = this.props;
            let { checked } = e.target;
            dispatch({ type: 'caseEdit/setGenerateBCP', payload: checked });
            // this.setState({ bcp: e.target.checked });
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
        getOptions = (data: Array<NVObject>): JSX.Element[] => {
            const { Option } = Select;
            return data.map<JSX.Element>((item: NVObject) =>
                <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
        }
        /**
         * 保存案件Click事件 
         */
        saveCaseClick = () => { }
        renderForm(): JSX.Element {
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 },
            };
            const { Item } = Form;
            const { data } = this.props.caseEdit;
            const { getFieldDecorator } = this.props.form;
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
                <Item label="送检单位">
                    {getFieldDecorator('sendUnit', {
                        initialValue: data.m_Clientinfo?.m_strClientName
                    })(<Input
                        prefix={<Icon type="bank" />}
                        maxLength={100} />)}

                </Item>
                <Item label="自动解析">
                    <Checkbox onChange={this.autoAnalysisChange} checked={data.m_bIsAutoParse} />
                    <Item label="生成BCP" style={{ display: 'inline-block', width: '60%' }} labelCol={{ span: 10 }}>
                        <Checkbox disabled={!data?.m_bIsAutoParse} onChange={this.bcpChange} checked={data?.m_bIsGenerateBCP} />
                    </Item>
                </Item>
                <div className="bcp-list">
                    <div className="bcp-list-bar">
                        <Icon type="appstore" rotate={45} />
                        <span>BCP 信息录入</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="执法办案系统案件编号"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CaseNo', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写执法办案系统案件编号'
                                    }
                                ],
                                initialValue: data.m_strCaseNo
                            })(<Input />)}
                        </Item>
                        <Item
                            label="执法办案系统案件类别"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CaseType', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: helper.isNullOrUndefined(data.m_strCaseType) ? '100' : data.m_strCaseType
                            })(<Select>
                                {this.getOptions(caseType)}
                            </Select>)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="执法办案系统案件名称"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CaseName', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写执法办案系统案件名称'
                                    }
                                ],
                                initialValue: data.m_strBCPCaseName
                            })(<Input />)}
                        </Item>
                        <Item
                            label="执法办案人员编号/检材持有人编号"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CasePersonNum', {
                                rules: [
                                    {
                                        required: false,
                                        message: '请填写执法办案人员编号/检材持有人编号'
                                    }
                                ],
                                initialValue: data.m_strCasePersonNum
                            })(<Input />)}
                        </Item>
                    </div>
                </div>
                <Item className="app-list-item">
                    <div className="app-list-panel" style={{ display: data.m_bIsAutoParse ? 'block' : 'none' }}>
                        <AppList apps={this.state.apps} />
                    </div>
                </Item>
            </Form>;
        }
        getCaseNameFromPath(path: string) {
            if (helper.isNullOrUndefined(path)) {
                return helper.EMPTY_STRING;
            }
            let pos = path.lastIndexOf('\\');
            return path.substring(pos + 1).split('_')[0];
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