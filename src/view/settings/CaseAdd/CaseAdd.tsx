import React, { Component, ChangeEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import debounce from 'lodash/debounce';
import Checkbox from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import Title from '@src/components/title/Title';
import AppList from '@src/components/AppList/AppList';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import { apps } from '@src/config/view.config';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { helper } from '@src/utils/helper';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import './CaseAdd.less';

interface IProp extends IComponent {
    caseAdd: IObject;
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
                value: '', //输入域值
                errorMsg: null,//错误文案
                validateStatus: 'success'//当前验证状态
            },
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
    getAllPackages(): string[] {
        const { fetch } = apps;
        let result = fetch.reduce((acc: string[], current: ICategory) => {
            return [...acc, ...current.app_list.map((item: IIcon) => item.packages).flat()];
        }, []);
        return result;
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
        const { autoAnalysis, bcp, apps, caseName } = this.state;
        if (caseName.value === '') {
            //验证必填
            this.validateCaseName(caseName.value);
        } else {
            let packages: string[] = []; //选中的App包名
            apps.forEach((catetory: IObject, index: number) => {
                packages = packages.concat(catetory.app_list.reduce((total: any[], current: IObject) => {
                    if (current.select === 1 && current.packages.length > 0) {
                        total.push(...current.packages)
                    }
                    return total;
                }, []));
            });
            if (autoAnalysis && packages.length === 0) {
                message.destroy();
                message.info('请选择要解析的App');
            } else {
                let entity = new CCaseInfo({
                    m_strCaseName: `${caseName.value}_${helper.timestamp()}`,
                    m_bIsAutoParse: autoAnalysis,
                    m_bIsGenerateBCP: bcp,
                    //NOTE:如果"是"自动解析，那么保存用户选的包名;否则保存全部App包名
                    m_Applist: autoAnalysis ? packages : this.getAllPackages()
                });
                this.saveCase(entity);
            }
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
        this.setState({
            bcp: e.target.checked
        });
    }
    renderForm(): JSX.Element {
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
                <Input
                    onChange={this.caseNameChange}
                    value={this.state.caseName.value}
                    prefix={<Icon type="profile" />} />
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
    render(): JSX.Element {
        return <div className="case-add-panel">
            <Title returnText="返回" okText="确定"
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