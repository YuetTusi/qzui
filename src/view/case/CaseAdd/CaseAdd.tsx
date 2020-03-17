import React, { Component, ChangeEvent } from 'react';
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
import Form from 'antd/lib/form';
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
import './CaseAdd.less';

interface IProp extends StoreComponent {
    caseAdd: StoreState;
}
interface IState {
    /**
     * 表单字段
     */
    fields: { [name: string]: FieldValue };
    currentCaseName: FieldValue;//案件名称
    sendUnit: string;//送检单位
    apps: Array<ICategory>;   //App列表数据
    autoAnalysis: boolean; //是否自动解析
    isShowAppList: boolean; //是否显示App列表
    isDisableBCP: boolean; //是否禁用BCP
    bcp: boolean; //是否生成BCP
}

/**
 * 表单字段及较验信息
 */
interface FieldValue {
    /**
     * 值
     */
    value: string;
    /**
     * 较验状态
     */
    validateStatus: '' | 'success' | 'error' | 'warning' | 'validating' | undefined;
    /**
     * 错误文案
     */
    errorMsg: string | null;
    /**
     * 标签文字
     */
    label: string;
}

/**
 * 新增案件
 */
class CaseAdd extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
        this.state = {
            currentCaseName: { value: '', validateStatus: 'success', errorMsg: null, label: '案件名称' },
            fields: {
                'Name': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人姓名' },
                'CertificateType': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人证件类型' },
                'CertificateCode': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人证件编号' },
                'CertificateIssueUnit': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人证件签发机关' },
                'CertificateEffectDate': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人证件生效日期' },
                'CertificateInvalidDate': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人证件失效日期' },
                'SexCode': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人性别' },
                'Nation': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人民族' },
                'Birthday': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人生日' },
                'Address': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人住址' },
                'UserPhoto': { value: '', validateStatus: 'success', errorMsg: null, label: '检材持有人证件头像' },
                'CaseNo': { value: '', validateStatus: 'success', errorMsg: null, label: '执法办案系统案件编号' },
                'CaseType': { value: '', validateStatus: 'success', errorMsg: null, label: '执法办案系统案件类别' },
                'CaseName': { value: '', validateStatus: 'success', errorMsg: null, label: '执法办案系统案件名称' },
                'CasePersonNum': { value: '', validateStatus: 'success', errorMsg: null, label: '执法办案人员编号/检材持有人编号' },
            },
            sendUnit: '',
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
        const { fields, autoAnalysis, bcp, apps, currentCaseName } = this.state;
        const { saving } = this.props.caseAdd;
        if (!this.doValidateBcpFields()) {
            return;
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
                let clientInfoEntity = new CClientInfo();
                clientInfoEntity.m_strClientName = this.state.sendUnit;
                let entity = new CCaseInfo({
                    m_strCaseName: `${currentCaseName.value.replace(/_/g, '')}_${helper.timestamp()}`,
                    m_bIsAutoParse: autoAnalysis,
                    m_bIsGenerateBCP: bcp,
                    m_Clientinfo: clientInfoEntity,
                    //NOTE:如果"是"自动解析，那么保存用户选的包名;否则保存全部App包名
                    m_Applist: autoAnalysis ? packages : this.getAllPackages()
                });
                if (!saving) {
                    this.saveCase(entity);
                }
            }
        }
    }
    /**
     * 验证所有的必填项是否通过
     */
    validateAllFieldsIsNull = () => {
        // const { fields } = this.state;
        // if (fields['currentCaseName'].value.length === 0 || fields['currentCaseName'].value == '') {
        //     return false;
        // } else {
        //     return true;
        // }
        return true;
    }
    /**
     * 执行表单校验
     */
    doValidateBcpFields = () => {
        const { bcp, fields, currentCaseName } = this.state;
        let success = true;
        let formData: { [name: string]: FieldValue } = { ...fields };
        if (currentCaseName.value == '' || helper.isNullOrUndefined(currentCaseName.value)) {
            success = false;
            this.setState({
                currentCaseName: {
                    ...currentCaseName,
                    validateStatus: 'error',
                    errorMsg: '请填写案件名称'
                }
            });
        }
        if (bcp) {
            for (let [fieldName, fieldValue] of Object.entries(fields)) {
                if (fieldValue.value.length === 0 || helper.isNullOrUndefined(fieldValue.value)) {
                    fieldValue.validateStatus = 'error';
                    fieldValue.errorMsg = `请填写${fieldValue.label}`;
                    formData = {
                        ...formData,
                        [fieldName]: {
                            ...fieldValue,
                            validateStatus: 'error',
                            errorMsg: `请填写${fieldValue.label}`
                        }
                    };
                    success = false;
                } else {
                    formData = {
                        ...formData,
                        [fieldName]: {
                            ...fieldValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    };
                }
            }
            this.setState({ fields: formData });
        } else {
            for (let [fieldName, fieldValue] of Object.entries(fields)) {
                formData = {
                    ...formData,
                    [fieldName]: {
                        ...fieldValue,
                        validateStatus: 'success',
                        errorMsg: null
                    }
                };
            }
            this.setState({ fields: formData });
        }
        return success;
    }
    /**
     * 案件名称必填验证
     * @param {string} value 案件名称
     */
    validateField = (value: string, field: string, label: string) => {
        if (value.length === 0 || helper.isNullOrUndefined(value)) {
            this.setState({
                fields: {
                    ...this.state.fields,
                    [field]: {
                        value,
                        validateStatus: 'error',
                        errorMsg: `请填写${label}`,
                        label
                    }
                }
            });
        } else {
            this.setState({
                fields: {
                    ...this.state.fields,
                    [field]: {
                        value,
                        validateStatus: 'success',
                        errorMsg: null,
                        label
                    }
                }
            });
        }
    }
    /**
     * 表单输入项Change事件
     * @param value 输入域值
     * @param field 输入域字段名
     * @param {string} label 标签名
     */
    fieldChange = (value: string, field: string, label: string) => {
        this.validateField(value, field, label);
    }
    /**
     * 案件名称Change事件
     */
    currentCaseNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            currentCaseName: {
                ...this.state.currentCaseName,
                value: e.target.value,
                validateStatus: e.target.value == '' ? 'error' : 'success',
                errorMsg: e.target.value == '' ? '请填写案件名称' : null
            }
        });
    }
    /**
     * 送检单位输入Change
     */
    sendUnitChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ sendUnit: e.target.value });
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
        const { fields, bcp } = this.state;
        const { Item } = Form;
        return <Form {...formItemLayout}>
            <Item
                label="案件名称"
                required={true}
                validateStatus={this.state.currentCaseName.validateStatus}
                help={this.state.currentCaseName.errorMsg}>
                <Input
                    onChange={this.currentCaseNameChange}
                    value={this.state.currentCaseName.value}
                    prefix={<Icon type="profile" />}
                    maxLength={100} />
            </Item>
            <Item
                label="送检单位">
                <Input
                    onChange={this.sendUnitChange}
                    value={this.state.sendUnit}
                    prefix={<Icon type="bank" />}
                    maxLength={100} />
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
                        required={bcp}
                        validateStatus={fields['Name'].validateStatus}
                        help={fields['Name'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Input
                            onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'Name', '检材持有人姓名')}
                            value={fields['Name'].value} />
                    </Item>
                    <Item
                        label="检材持有人证件类型"
                        validateStatus={fields['CertificateType'].validateStatus}
                        help={fields['CertificateType'].errorMsg}
                        required={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Select
                            defaultValue={'111'}
                            onChange={(value: string) => this.fieldChange(value, 'CertificateType', '检材持有人证件类型')}>
                            {this.getOptions(certificateType)}
                        </Select>
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人证件编号"
                        required={bcp}
                        validateStatus={fields['CertificateCode'].validateStatus}
                        help={fields['CertificateCode'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Input onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'CertificateCode', '检材持有人证件编号')} />
                    </Item>
                    <Item
                        label="检材持有人证件签发机关"
                        required={bcp}
                        validateStatus={fields['CertificateIssueUnit'].validateStatus}
                        help={fields['CertificateIssueUnit'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Input onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'CertificateIssueUnit', '检材持有人证件签发机关')} />
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人证件生效日期"
                        required={false}
                        validateStatus={fields['CertificateEffectDate'].validateStatus}
                        help={fields['CertificateEffectDate'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <DatePicker
                            onChange={(date: moment.Moment, dateString: string) => this.fieldChange(dateString, 'CertificateEffectDate', '检材持有人证件生效日期')}
                            defaultValue={moment()}
                            style={{ width: '100%' }}
                            locale={locale} />
                    </Item>
                    <Item
                        label="检材持有人证件失效日期"
                        required={false}
                        validateStatus={fields['CertificateInvalidDate'].validateStatus}
                        help={fields['CertificateInvalidDate'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <DatePicker
                            onChange={(date: moment.Moment, dateString: string) => this.fieldChange(dateString, 'CertificateInvalidDate', '检材持有人证件失效日期')}
                            defaultValue={moment()}
                            style={{ width: '100%' }}
                            locale={locale} />
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人性别"
                        required={false}
                        validateStatus={fields['SexCode'].validateStatus}
                        help={fields['SexCode'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Select
                            defaultValue={'0'}
                            onChange={(value: string) => this.fieldChange(value, 'SexCode', '检材持有人性别')}>
                            {this.getOptions(sexCode)}
                        </Select>
                    </Item>
                    <Item
                        label="检材持有人民族"
                        required={false}
                        validateStatus={fields['Nation'].validateStatus}
                        help={fields['Nation'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Select
                            defaultValue={'1'}
                            onChange={(value: string) => this.fieldChange(value, 'Nation', '检材持有人民族')}>
                            {this.getOptions(ethnicity)}
                        </Select>
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人生日"
                        required={false}
                        validateStatus={fields['Birthday'].validateStatus}
                        help={fields['Birthday'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <DatePicker
                            onChange={(date: moment.Moment, dateString: string) => this.fieldChange(dateString, 'Birthday', '检材持有人生日')}
                            defaultValue={moment()}
                            style={{ width: '100%' }}
                            locale={locale} />
                    </Item>
                    <Item
                        label="检材持有人证件头像"
                        required={bcp}
                        validateStatus={fields['UserPhoto'].validateStatus}
                        help={fields['UserPhoto'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Input onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'UserPhoto', '检材持有人证件头像')} />
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="检材持有人住址"
                        required={bcp}
                        validateStatus={fields['Address'].validateStatus}
                        help={fields['Address'].errorMsg}
                        style={{ flex: 1 }}>
                        <Input onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'Address', '检材持有人住址')} />
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="执法办案系统案件编号"
                        required={bcp}
                        validateStatus={fields['CaseNo'].validateStatus}
                        help={fields['CaseNo'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Input onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'CaseNo', '执法办案系统案件编号')} />
                    </Item>
                    <Item
                        label="执法办案系统案件类别"
                        required={false}
                        validateStatus={fields['CaseType'].validateStatus}
                        help={fields['CaseType'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Select onChange={(value: string) => this.fieldChange(value, 'CaseType', '执法办案系统案件类别')}>
                            {this.getOptions(caseType)}
                        </Select>
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="执法办案系统案件名称"
                        required={bcp}
                        validateStatus={fields['CaseName'].validateStatus}
                        help={fields['CaseName'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Input onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'CaseName', '执法办案系统案件名称')} />
                    </Item>
                    <Item
                        label="执法办案人员编号/检材持有人编号"
                        required={bcp}
                        validateStatus={fields['CasePersonNum'].validateStatus}
                        help={fields['CasePersonNum'].errorMsg}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}
                        style={{ flex: 1 }}>
                        <Input onChange={(e: ChangeEvent<HTMLInputElement>) => this.fieldChange(e.target.value, 'CasePersonNum', '执法办案人员编号/检材持有人编号')} />
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
}

export default connect((state: any) => ({ caseAdd: state.caseAdd }))(CaseAdd);