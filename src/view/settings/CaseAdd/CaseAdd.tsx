import React, { Component, ReactElement, ChangeEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import uuid from 'uuid/v4';
import debounce from 'lodash/debounce';
import { Form, Input, Checkbox } from 'antd';
import Title from '@src/components/title/Title';
import AppList from '@src/components/AppList/AppList';
import { ICategory } from '@src/components/AppList/IApps';
import { apps } from '@src/config/view.config';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { helper } from '@src/utils/helper';
import './CaseAdd.less';

interface IProp extends IComponent {
    caseAdd: IObject;
    form: IObject;
}
interface IState {
    caseName: IObject; //案件名称
    apps: Array<ICategory>;   //App列表数据
    autoAnalysis: boolean; //是否自动解析
    isShowAppList: boolean; //是否显示App列表
    isDisableBCP: boolean; //是否禁用BCP
    bcp: boolean; //是否生成BCP
}

/**
 * 新增案件
 */
class CaseAdd extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
        this.state = {
            caseName: {
                value: '',
                errorMsg: null,
                validateStatus: 'success'
            },
            autoAnalysis: false,
            apps: apps.fetch,
            isShowAppList: false,
            isDisableBCP: true,
            bcp: false
        }
        // this.saveCase = debounce(this.saveCase, 1200, {
        //     leading: true,
        //     trailing: false
        // }); //防抖
    }
    /**
     * 保存案件
     */
    saveCase() {
        console.log('执行保存...');
    }
    /**
     * 保存案件Click事件 
     */
    saveCaseClick() {
        const { autoAnalysis, bcp, apps, caseName } = this.state;
        if (caseName.value === '') {
            this.validateCaseName(caseName.value);
        } else {
            console.log(`caseName:${caseName.value}, autoAnalysis:${autoAnalysis}, bcp:${bcp}`);
            console.log(apps);
            // this.saveCase();
        }
    }
    /**
     * 案件名称必填验证
     * @param {string} value 案件名称
     */
    validateCaseName(value: string) {
        if (value.length === 0 || helper.isNullOrUndefined(value)) {
            this.setState({
                caseName: {
                    value,
                    validateStatus: 'error',
                    errorMsg: '请填写案件名称'
                }
            });
        } else {
            this.setState({
                caseName: {
                    value,
                    validateStatus: 'success',
                    errorMsg: null
                }
            });
        }
    }
    /**
     * 案件名称输入Change
     */
    caseNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.validateCaseName(e.target.value);
    }
    /**
     * 自动解析Change事件
     */
    autoAnalysisChange = (e: CheckboxChangeEvent) => {
        let { checked } = e.target;
        this.setState({
            autoAnalysis: checked,
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
    renderForm(): ReactElement {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 },
        };
        const { Item } = Form;
        return <Form {...formItemLayout}>
            <Item
                label="案件名称"
                required={true}
                validateStatus={this.state.caseName.validateStatus}
                help={this.state.caseName.errorMsg}>
                <Input onChange={this.caseNameChange} value={this.state.caseName.value} />
            </Item>
            <Item label="自动解析">
                <Checkbox onChange={this.autoAnalysisChange} checked={this.state.autoAnalysis} />
                <Item label="生成BCP" style={{ display: 'inline-block', width: '60%' }} labelCol={{ span: 10 }}>
                    <Checkbox disabled={this.state.isDisableBCP} onChange={this.bcpChange} checked={this.state.bcp} />
                </Item>
            </Item>
            <Item className="app-list-item">
                <div className="app-list-panel" style={{ display: this.state.isShowAppList ? 'block' : 'none' }}>
                    <AppList apps={this.state.apps} />
                </div>
            </Item>
        </Form>;
    }
    render(): ReactElement {
        return <div className="case-add-panel">
            <Title returnText="返回" okText="保存"
                onReturn={() => this.props.dispatch(routerRedux.push('/settings/case'))}
                onOk={() => this.saveCaseClick()}>
                新增案件
                </Title>
            <div className="form-panel">
                {this.renderForm()}
            </div>
        </div>
    }
}

export default connect((state: IObject) => ({ caseAdd: state.caseAdd }))(CaseAdd);