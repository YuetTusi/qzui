import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import { Form, Input, Checkbox } from 'antd';
import './CaseAdd.less';
import Title from '@src/components/title/Title';
import AppList from '@src/components/AppList/AppList';
import { apps } from '@src/config/view.config';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface IProp extends IComponent {
    caseAdd: IObject;
    form: IObject;
}
interface IState {
    apps: Array<any>;
    isShowAppList: boolean; //是否显示App列表
    isDisableBCP: boolean; //是否禁用BCP
    bcp: boolean; //是否生成BCP
}

const CaseAddExtend = Form.create({ name: 'add' })(
    /**
     * 新增案件
     */
    class CaseAdd extends Component<IProp, IState> {
        constructor(props: IProp) {
            super(props);
            this.state = {
                apps: apps.fetch,
                isShowAppList: false,
                isDisableBCP: true,
                bcp: false
            }
        }
        /**
         * 自动解析Change事件
         */
        autoAnalysisChange = (e: CheckboxChangeEvent) => {
            let { checked } = e.target;
            this.setState({
                isShowAppList: checked,
                isDisableBCP: !checked,
                bcp: false
            });
        }
        /**
         * 生成BCP Change事件
         */
        bcpChange = (e: CheckboxChangeEvent) => {
            this.setState({
                bcp: e.target.checked
            });
        }
        /**
         * App选择回调
         */
        selectHandle(apps: IObject) {
            console.log(apps);
        }
        renderForm(): ReactElement {
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 },
            };
            const { Item } = Form;
            return <Form {...formItemLayout}>
                <Item label="案件名称">
                    <Input />
                </Item>
                <Item label="自动解析">
                    <Checkbox onChange={this.autoAnalysisChange} />
                    <Item label="生成BCP" style={{ display: 'inline-block', width: '60%' }} labelCol={{ span: 10 }}>
                        <Checkbox disabled={this.state.isDisableBCP} onChange={this.bcpChange} checked={this.state.bcp} />
                    </Item>
                </Item>
                <Item className="app-list-item">
                    <div className="app-list-panel" style={{ display: this.state.isShowAppList ? 'block' : 'none' }}>
                        <AppList
                            apps={this.state.apps}
                            selectHandle={this.selectHandle} />
                    </div>
                </Item>
            </Form>;
        }
        render(): ReactElement {
            return <div className="case-add-panel">
                <Title returnText="返回" okText="保存"
                    onReturn={() => this.props.dispatch(routerRedux.push('/settings/case'))}
                    onOk={() => { }}>
                    新增案件
                </Title>
                <div className="form-panel">
                    {this.renderForm()}
                </div>
            </div>
        }
    }
);

export default connect((state: IObject) => ({ caseAdd: state.caseAdd }))(CaseAddExtend);