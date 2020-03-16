import React, { FC, PropsWithChildren, ChangeEvent, useState } from 'react';
import moment from 'moment';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import { caseType } from '@src/schema/CaseType';
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';
import { certificateType } from '@src/schema/CertificateType';
import { IObject } from '@src/type/model';
import { helper } from '@src/utils/helper';

interface Props {
    /**
     * 是否必填
     */
    required: boolean;
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
    validateStatus: "" | "success" | "error" | "warning" | "validating" | undefined;
    /**
     * 错误文案
     */
    errorMsg: string | null;
}


/**
 * BCP输入组件
 * @param props 
 */
const BcpInput: FC<Props> = (props: PropsWithChildren<Props>): JSX.Element => {

    const [fields, setFields] = useState<{ [name: string]: FieldValue }>({
        'Name': { value: '', validateStatus: 'success', errorMsg: null },
        'CertificateType': { value: '', validateStatus: 'success', errorMsg: null },
        'CertificateCode': { value: '', validateStatus: 'success', errorMsg: null },
        'CertificateIssueUnit': { value: '', validateStatus: 'success', errorMsg: null },
        'CertificateEffectDate': { value: '', validateStatus: 'success', errorMsg: null },
        'CertificateInvalidDate': { value: '', validateStatus: 'success', errorMsg: null },
        'SexCode': { value: '', validateStatus: 'success', errorMsg: null },
        'Nation': { value: '', validateStatus: 'success', errorMsg: null },
        'Birthday': { value: '', validateStatus: 'success', errorMsg: null },
        'Address': { value: '', validateStatus: 'success', errorMsg: null },
        'UserPhoto': { value: '', validateStatus: 'success', errorMsg: null },
        'CaseNo': { value: '', validateStatus: 'success', errorMsg: null },
        'CaseType': { value: '', validateStatus: 'success', errorMsg: null },
        'CaseName': { value: '', validateStatus: 'success', errorMsg: null },
        'CasePersonNum': { value: '', validateStatus: 'success', errorMsg: null },
    });

    const { Item } = Form;

    /**
     * 表单项必填验证
     * @param {string} value 案件名称
     * @param {string} field 输入域名称
     * @param {string} label 标签名
     */
    const validateField = (value: string, field: string, label: string) => {

        if (value.length === 0 || helper.isNullOrUndefined(value)) {
            setFields({
                ...fields,
                [field]: {
                    value,
                    validateStatus: 'error',
                    errorMsg: `请填写${label}`
                }
            });
        } else {
            setFields({
                ...fields,
                [field]: {
                    value,
                    validateStatus: 'success',
                    errorMsg: null
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
    const fieldChange = (value: string, field: string, label: string) => {
        validateField(value, field, label);
    }

    return <>
        <div style={{ display: 'flex' }}>
            <Item
                label="检材持有人姓名"
                required={props.required}
                validateStatus={fields['Name'].validateStatus}
                help={fields['Name'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Input
                    onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'Name', '检材持有人姓名')}
                    value={fields['Name'].value} />
            </Item>
            <Item
                label="检材持有人证件类型"
                validateStatus={fields['CertificateType'].validateStatus}
                help={fields['CertificateType'].errorMsg}
                required={props.required}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Select
                    defaultValue={'111'}
                    onChange={(value: string) => fieldChange(value, 'CertificateType', '检材持有人证件类型')}>
                    {getOptions(certificateType)}
                </Select>
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item
                label="检材持有人证件编号"
                required={props.required}
                validateStatus={fields['CertificateCode'].validateStatus}
                help={fields['CertificateCode'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CertificateCode', '检材持有人证件编号')} />
            </Item>
            <Item
                label="检材持有人证件签发机关"
                required={props.required}
                validateStatus={fields['CertificateIssueUnit'].validateStatus}
                help={fields['CertificateIssueUnit'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CertificateIssueUnit', '检材持有人证件签发机关')} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item
                label="检材持有人证件生效日期"
                required={props.required}
                validateStatus={fields['CertificateEffectDate'].validateStatus}
                help={fields['CertificateEffectDate'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <DatePicker
                    onChange={(date: moment.Moment, dateString: string) => fieldChange(dateString, 'CertificateEffectDate', '检材持有人证件生效日期')}
                    defaultValue={moment()}
                    style={{ width: '100%' }}
                    locale={locale} />
            </Item>
            <Item
                label="检材持有人证件失效日期"
                required={props.required}
                validateStatus={fields['CertificateInvalidDate'].validateStatus}
                help={fields['CertificateInvalidDate'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <DatePicker
                    onChange={(date: moment.Moment, dateString: string) => fieldChange(dateString, 'CertificateInvalidDate', '检材持有人证件失效日期')}
                    defaultValue={moment()}
                    style={{ width: '100%' }}
                    locale={locale} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item
                label="检材持有人性别"
                required={props.required}
                validateStatus={fields['SexCode'].validateStatus}
                help={fields['SexCode'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Select
                    defaultValue={'0'}
                    onChange={(value: string) => fieldChange(value, 'SexCode', '检材持有人性别')}>
                    {getOptions(sexCode)}
                </Select>
            </Item>
            <Item
                label="检材持有人民族"
                required={props.required}
                validateStatus={fields['Nation'].validateStatus}
                help={fields['Nation'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Select
                    defaultValue={'1'}
                    onChange={(value: string) => fieldChange(value, 'Nation', '检材持有人民族')}>
                    {getOptions(ethnicity)}
                </Select>
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item
                label="检材持有人生日"
                required={props.required}
                validateStatus={fields['Birthday'].validateStatus}
                help={fields['Birthday'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <DatePicker
                    onChange={(date: moment.Moment, dateString: string) => fieldChange(dateString, 'Birthday', '检材持有人生日')}
                    defaultValue={moment()}
                    style={{ width: '100%' }}
                    locale={locale} />
            </Item>
            <Item
                label="检材持有人证件头像"
                required={props.required}
                validateStatus={fields['UserPhoto'].validateStatus}
                help={fields['UserPhoto'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'UserPhoto', '检材持有人证件头像')} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item
                label="检材持有人住址"
                required={props.required}
                validateStatus={fields['Address'].validateStatus}
                help={fields['Address'].errorMsg}
                style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'Address', '检材持有人住址')} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item
                label="执法办案系统案件编号"
                required={props.required}
                validateStatus={fields['CaseNo'].validateStatus}
                help={fields['CaseNo'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CaseNo', '执法办案系统案件编号')} />
            </Item>
            <Item
                label="执法办案系统案件类别"
                required={props.required}
                validateStatus={fields['CaseType'].validateStatus}
                help={fields['CaseType'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Select onChange={(value: string) => fieldChange(value, 'CaseType', '执法办案系统案件类别')}>
                    {getOptions(caseType)}
                </Select>
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item
                label="执法办案系统案件名称"
                required={props.required}
                validateStatus={fields['CaseName'].validateStatus}
                help={fields['CaseName'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CaseName', '执法办案系统案件名称')} />
            </Item>
            <Item
                label="执法办案人员编号/检材持有人编号"
                required={props.required}
                validateStatus={fields['CasePersonNum'].validateStatus}
                help={fields['CasePersonNum'].errorMsg}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CasePersonNum', '执法办案人员编号/检材持有人编号')} />
            </Item>
        </div>
    </>;
}

/**
 * 将JSON数据转为Options元素
 * @param data JSON数据
 */
const getOptions = (data: Array<IObject>): JSX.Element[] => {
    const { Option } = Select;
    return data.map<JSX.Element>((item: IObject) =>
        <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
}

export default BcpInput;