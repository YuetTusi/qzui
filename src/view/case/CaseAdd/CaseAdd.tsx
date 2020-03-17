import { remote, OpenDialogReturnValue } from 'electron';
import React, { Component, MouseEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, StoreComponent } from '@src/type/model';
import { StoreState } from '@src/model/case/CaseAdd/CaseAdd';
import debounce from 'lodash/debounce';
import moment from 'moment';
import Checkbox from 'antd/lib/checkbox';
import Icon from 'antd/lib/icon';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/zh_CN';
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
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';
import { certificateType } from '@src/schema/CertificateType';
import { CaseForm } from './caseForm';
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
    userPhotoPath: string;//头像路径
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
                bcp: false,
                userPhotoPath: ''
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
            const { validateFields } = this.props.form;
            const { autoAnalysis, bcp, apps } = this.state;

            this.props.form.validateFields((err, values: CaseForm) => {
                if (helper.isNullOrUndefined(err)) {
                    // console.log(values);
                    // console.log('较验成功');
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
                        let clientInfoEntity = new CClientInfo();
                        clientInfoEntity.m_strClientName = values.sendUnit;
                        let entity = new CCaseInfo({
                            m_strCaseName: `${values.currentCaseName.replace(/_/g, '')}_${helper.timestamp()}`,
                            m_bIsAutoParse: autoAnalysis,
                            m_bIsGenerateBCP: bcp,
                            m_Clientinfo: clientInfoEntity,
                            //NOTE:如果"是"自动解析，那么保存用户选的包名;否则保存全部App包名
                            m_Applist: autoAnalysis ? packages : this.getAllPackages()
                        });
                        console.log('执行保存操作...');
                        console.log(entity);
                        console.log(values);
                        // this.saveCase(entity);
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
            this.setState({
                bcp: e.target.checked
            });
        }
        /**
         * 选择头像路径Handle
         */
        selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
            const { setFieldsValue } = this.props.form;
            remote.dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
                ]
            }).then((val: OpenDialogReturnValue) => {
                if (val.filePaths && val.filePaths.length > 0) {
                    setFieldsValue({ UserPhoto: val.filePaths[0] });
                    // this.setState({ userPhotoPath: val.filePaths[0] });
                }
            });
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
        renderForm(): JSX.Element {
            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 18 },
            };
            const { bcp } = this.state;
            const { Item } = Form;
            const { getFieldDecorator } = this.props.form;
            return <Form {...formItemLayout}>
                <Item
                    label="案件名称">
                    {getFieldDecorator('currentCaseName', {
                        rules: [{ required: true, message: '请填写案件名称' }]
                    })(<Input
                        prefix={<Icon type="profile" />}
                        maxLength={100} />)}

                </Item>
                <Item label="送检单位">
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
                        <span>BCP信息录入</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="检材持有人姓名"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('Name', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人姓名'
                                    }
                                ]
                            })(<Input />)}

                        </Item>
                        <Item
                            label="检材持有人证件类型"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateType', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: '111'
                            })(<Select>
                                {this.getOptions(certificateType)}
                            </Select>)}

                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="检材持有人证件编号"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateCode', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人证件编号'
                                    }
                                ]
                            })(<Input />)}
                        </Item>
                        <Item
                            label="检材持有人证件签发机关"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateIssueUnit', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人证件签发机关'
                                    }
                                ]
                            })(<Input />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="检材持有人证件生效日期"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateEffectDate', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人证件生效日期'
                                    }
                                ],
                                initialValue: moment(),
                            })(<DatePicker
                                style={{ width: '100%' }}
                                locale={locale} />)}
                        </Item>
                        <Item
                            label="检材持有人证件失效日期"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('CertificateInvalidDate', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人证件失效日期'
                                    }
                                ],
                                initialValue: moment()
                            })(<DatePicker
                                style={{ width: '100%' }}
                                locale={locale} />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="检材持有人性别"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('SexCode', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: '0'
                            })(<Select>
                                {this.getOptions(sexCode)}
                            </Select>)}
                        </Item>
                        <Item
                            label="检材持有人民族"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('Nation', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: '1'
                            })(<Select>
                                {this.getOptions(ethnicity)}
                            </Select>)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="检材持有人生日"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('Birthday', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人生日'
                                    }
                                ],
                                initialValue: moment()
                            })(<DatePicker
                                style={{ width: '100%' }}
                                locale={locale} />)}
                        </Item>
                        <Item
                            label="检材持有人证件头像"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ flex: 1 }}>
                            {getFieldDecorator('UserPhoto', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人证件头像'
                                    }
                                ]
                            })(<Input
                                addonAfter={<Icon type="ellipsis" onClick={this.selectDirHandle} />}
                                readOnly={true}
                                onClick={this.selectDirHandle} />)}
                        </Item>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Item
                            label="检材持有人住址"
                            style={{ flex: 1 }}>
                            {getFieldDecorator('Address', {
                                rules: [
                                    {
                                        required: bcp,
                                        message: '请填写检材持有人住址'
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
                            {getFieldDecorator('CaseNo', {
                                rules: [
                                    {
                                        required: bcp,
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
                            {getFieldDecorator('CaseType', {
                                rules: [
                                    { required: false }
                                ],
                                initialValue: '100'
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
                                        required: bcp,
                                        message: '请填写执法办案系统案件名称'
                                    }
                                ]
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
                                        required: bcp,
                                        message: '请填写执法办案人员编号/检材持有人编号'
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