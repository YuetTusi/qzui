import React, { FC, PropsWithChildren, ChangeEvent } from 'react';
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
 * BCP输入组件
 * @param props 
 */
const BcpInput: FC<Props> = (props: PropsWithChildren<Props>): JSX.Element => {
    const { Item } = Form;

    return <>
        <div style={{ display: 'flex' }}>
            <Item label="检材持有人姓名" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'Name')} />
            </Item>
            <Item label="检材持有人证件类型" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Select
                    defaultValue={'111'}
                    onChange={(value: string) => fieldChange(value, 'CertificateType')}>
                    {getOptions(certificateType)}
                </Select>
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item label="检材持有人证件编号" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CertificateCode')} />
            </Item>
            <Item label="检材持有人证件签发机关" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CertificateIssueUnit')} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item label="检材持有人证件生效日期" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <DatePicker
                    onChange={(date: moment.Moment, dateString: string) => fieldChange(dateString, 'CertificateEffectDate')}
                    defaultValue={moment()}
                    style={{ width: '100%' }}
                    locale={locale} />
            </Item>
            <Item label="检材持有人证件失效日期" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <DatePicker
                    onChange={(date: moment.Moment, dateString: string) => fieldChange(dateString, 'CertificateInvalidDate')}
                    defaultValue={moment()}
                    style={{ width: '100%' }}
                    locale={locale} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item label="检材持有人性别" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Select
                    defaultValue={'0'}
                    onChange={(value: string) => fieldChange(value, 'SexCode')}>
                    {getOptions(sexCode)}
                </Select>
            </Item>
            <Item label="检材持有人民族" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Select
                    defaultValue={'1'}
                    onChange={(value: string) => fieldChange(value, 'Nation')}>
                    {getOptions(ethnicity)}
                </Select>
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item label="检材持有人生日" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <DatePicker
                    onChange={(date: moment.Moment, dateString: string) => fieldChange(dateString, 'Birthday')}
                    defaultValue={moment()}
                    style={{ width: '100%' }}
                    locale={locale} />
            </Item>
            <Item label="检材持有人证件头像" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'UserPhoto')} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item label="检材持有人住址" required={props.required} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'Address')} />
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item label="执法办案系统案件编号" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CaseNo')} />
            </Item>
            <Item label="执法办案系统案件类别" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Select onChange={(value: string) => fieldChange(value, 'CaseType')}>
                    {getOptions(caseType)}
                </Select>
            </Item>
        </div>
        <div style={{ display: 'flex' }}>
            <Item label="执法办案系统案件名称" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CaseName')} />
            </Item>
            <Item label="执法办案人员编号/检材持有人编号" required={props.required} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => fieldChange(e.target.value, 'CasePersonNum')} />
            </Item>
        </div>
    </>;
}

/**
 * 表单输入项Change事件
 * @param value 输入域值
 * @param field 输入域字段名
 */
const fieldChange = (value: string, field: string) => {
    console.log('field: ', field);
    console.log('value: ', value);
    
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