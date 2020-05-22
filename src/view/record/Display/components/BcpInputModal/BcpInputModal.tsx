import React, { FC, useEffect, useRef, MouseEvent } from 'react';
import { OpenDialogReturnValue, remote } from 'electron';
import { Moment } from 'moment';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import Empty from 'antd/lib/empty';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { Prop, FormValue } from './ComponentType';
import { helper } from '@src/utils/helper';
import { NVObject } from '@src/type/model';
import { certificateType } from '@src/schema/CertificateType';
import { sexCode } from '@src/schema/SexCode';
import { ethnicity } from '@src/schema/Ethnicity';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { CBCPInfo } from '@src/schema/CBCPInfo';
import './BcpInputModal.less';

/**
 * BCP信息录入
 */
const BcpInputModal: FC<Prop> = (props) => {

    const { dispatch, casePath, phonePath } = props;
    const { bcpInfo } = props.bcpInputModal;
    let unitSearched = false;

    /**
     * 目的检验单位编号
     */
    let dstUnitNo = useRef(bcpInfo?.m_strDstOrganizationID);
    /**
     * 目的检验单位名称
     */
    let dstUnitName = useRef(bcpInfo?.m_strDstOrganizationName);
    /**
     * 保存选中检验单位编号
     */
    let unitListID = useRef(bcpInfo?.m_strCheckOrganizationID);
    /**
     * 保存选中检验单位名字
     */
    let unitListName = useRef(bcpInfo?.m_strCheckOrganizationName);
    /**
     * 检验员的编号
     */
    let officerSelectID = useRef(bcpInfo?.m_strCheckerID);
    /**
     * 检验员的名字
     */
    let officerSelectName = useRef(bcpInfo?.m_strCheckerName);

    useEffect(() => {
        dispatch({ type: 'bcpInputModal/queryOfficerList' });
    }, []);

    useEffect(() => {
        if (!helper.isNullOrUndefinedOrEmptyString(casePath)) {
            dispatch({ type: 'bcpInputModal/queryCase', payload: casePath });
        }
        if (!helper.isNullOrUndefinedOrEmptyString(phonePath)) {
            dispatch({ type: 'bcpInputModal/queryBcp', payload: phonePath });
        }
    }, [casePath, phonePath]);

    useEffect(() => {
        dstUnitNo.current = bcpInfo?.m_strDstOrganizationID;
        dstUnitName.current = bcpInfo?.m_strDstOrganizationName;
        unitListID.current = bcpInfo?.m_strCheckOrganizationID;
        unitListName.current = bcpInfo?.m_strCheckOrganizationName;
        officerSelectID.current = bcpInfo?.m_strCheckerID;
        officerSelectName.current = bcpInfo?.m_strCheckerName;
    }, [bcpInfo]);

    /**
     * 绑定检验单位下拉
     */
    const bindUnitSelect = () => {
        const { unitList, bcpInfo } = props.bcpInputModal;
        const { Option } = Select;
        let options = [];
        options = unitList.map((opt: CCheckOrganization) => {
            return <Option
                value={opt.m_strCheckOrganizationID}
                data-name={opt.m_strCheckOrganizationName}
                key={helper.getKey()}>
                {opt.m_strCheckOrganizationName}
            </Option>
        });
        if (!unitSearched &&
            !helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strCheckOrganizationID)) {
            options.push(<Option value={bcpInfo.m_strCheckOrganizationID}>
                {bcpInfo.m_strCheckOrganizationName}
            </Option>);
        }
        return options;
    }
    /**
     * 绑定目的检验单位下拉
     */
    const bindDstUnitSelect = () => {
        const { unitList, bcpInfo } = props.bcpInputModal;
        const { Option } = Select;
        let options = [];
        options = unitList.map((opt: CCheckOrganization) => {
            return <Option
                value={opt.m_strCheckOrganizationID}
                data-name={opt.m_strCheckOrganizationName}
                key={helper.getKey()}>
                {opt.m_strCheckOrganizationName}
            </Option>
        });
        if (!unitSearched &&
            !helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strDstOrganizationID)) {
            options.push(<Option value={bcpInfo.m_strDstOrganizationID}>
                {bcpInfo.m_strDstOrganizationName}
            </Option>);
        }
        return options;
    }

    /**
     * 下拉Search事件(所有单位下拉共用此回调)
     */
    const selectSearch = (keyword: string) => {
        const { dispatch } = props;
        unitSearched = true;
        dispatch!({ type: 'bcpInputModal/queryUnitData', payload: keyword });
    }

    /**
     * 目的检验单位下拉Change事件
     */
    const dstUnitChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
        const { children } = (opt as JSX.Element).props;
        dstUnitNo.current = val;
        dstUnitName.current = children;
    }

    /**
     * 检验单位下拉Change事件
     */
    const unitListChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
        const { children } = (opt as JSX.Element).props;
        unitListID.current = val;
        unitListName.current = children;
    }

    /**
     * 绑定采集人员下拉
     */
    const bindOfficerSelect = () => {
        const { officerList } = props.bcpInputModal;
        const { Option } = Select;
        let options = officerList.map((opt: CCheckerInfo) => {
            return <Option
                value={opt.m_strCheckerID}
                data-name={opt.m_strCheckerName}
                data-id={opt.m_strCheckerID}
                key={helper.getKey()}>
                {opt.m_strCheckerID ? `${opt.m_strCheckerName}（${opt.m_strCheckerID}）` : opt.m_strCheckerName}
            </Option>
        });
        return options;
    }

    /**
     * 采集人员下拉Change事件
     */
    const officerSelectChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
        const { props } = (opt as JSX.Element);
        officerSelectName.current = props['data-name'];
        officerSelectID.current = props['data-id'];
    }

    const getOptions = (data: NVObject[]): JSX.Element[] => {
        const { Option } = Select;
        return data.map<JSX.Element>(({ name, value }: NVObject) =>
            <Option value={value} key={helper.getKey()}>{name}</Option>);
    }

    /**
     * 选择头像路径Handle
     */
    const selectAvatarHandle = debounce((event: MouseEvent<HTMLInputElement>) => {
        const { setFieldsValue } = props.form;
        remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
            ]
        }).then((val: OpenDialogReturnValue) => {
            if (val.filePaths && val.filePaths.length > 0) {
                setFieldsValue({ UserPhoto: val.filePaths[0] });
            }
        });
    }, 600, {
        leading: true,
        trailing: false
    });

    /**
     * 生成BCP按钮Click
     */
    const generateBcpClick = () => {
        const { validateFields } = props.form;
        const { bcpInfo, caseData } = props.bcpInputModal;
        validateFields((errors: any, values: FormValue) => {
            if (helper.isNullOrUndefined(errors)) {
                let entity: CBCPInfo = {
                    ...bcpInfo
                }

                if (caseData.m_bIsGenerateBCP) {
                    //#生成BCP
                    entity.m_strCheckerID = officerSelectID.current;
                    entity.m_strCheckerName = officerSelectName.current;
                    entity.m_strCheckOrganizationID = unitListID.current;
                    entity.m_strCheckOrganizationName = unitListName.current;
                    entity.m_strDstOrganizationID = dstUnitNo.current;
                    entity.m_strDstOrganizationName = dstUnitName.current;
                } else {
                    //#不生成BCP
                    entity.m_strCheckerID = '';
                    entity.m_strCheckerName = values.officerInput;
                    entity.m_strCheckOrganizationID = '';
                    entity.m_strCheckOrganizationName = values.unitInput;
                    entity.m_strDstOrganizationID = '';
                    entity.m_strDstOrganizationName = values.dstUnitInput;
                }
                // entity.m_strCheckerID = officerSelectID;
                // entity.m_strCheckerName = officerSelectName;
                // entity.m_strCheckOrganizationID = unitListID;
                // entity.m_strCheckOrganizationName = unitListName;
                // entity.m_strDstOrganizationID = dstUnitNo;
                // entity.m_strDstOrganizationName = dstUnitName;

                entity.m_strAddress = values.Address;
                entity.m_strBirthday = helper.isNullOrUndefinedOrEmptyString(values.Birthday) ? '' : values.Birthday.format('YYYY-MM-DD');
                entity.m_strCertificateCode = values.CertificateCode;
                entity.m_strCertificateEffectDate = helper.isNullOrUndefinedOrEmptyString(values.CertificateEffectDate) ? '' : values.CertificateEffectDate.format('YYYY-MM-DD');
                entity.m_strCertificateInvalidDate = helper.isNullOrUndefinedOrEmptyString(values.CertificateInvalidDate) ? '' : values.CertificateInvalidDate.format('YYYY-MM-DD');
                entity.m_strCertificateIssueUnit = values.CertificateIssueUnit;
                entity.m_strCertificateType = values.CertificateType;
                entity.m_strNation = values.Nation;
                entity.m_strSexCode = values.SexCode;
                entity.m_strUserPhoto = values.UserPhoto;
                props.okHandle(entity, Number(values.m_bIsAttachment), phonePath);
            }
        });
    }

    /**
     * 表单渲染
     */
    const renderForm = () => {
        const { Item } = Form;
        const { getFieldDecorator } = props.form;
        const { bcpInfo, caseData } = props.bcpInputModal;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 19 },
        };
        return <div className="bcp-modal-root">
            <Form {...formItemLayout}>
                <div style={{ display: 'flex' }}>
                    <Item label="有无附件" style={{ flex: 1 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('m_bIsAttachment', {
                            rules: [{
                                required: true,
                                message: '请选择有无附件'
                            }],
                            initialValue: helper.isNullOrUndefined(caseData.m_bIsAttachment) ? 0 : Number(caseData.m_bIsAttachment)
                        })(<Select>
                            <Select.Option value={1}>有附件</Select.Option>
                            <Select.Option value={0}>无附件</Select.Option>
                        </Select>)}
                    </Item>
                    <Item
                        style={{ flex: 1, display: caseData.m_bIsGenerateBCP ? 'flex' : 'none' }}
                        label="采集人员"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('officerSelect', {
                            rules: [{
                                required: caseData.m_bIsGenerateBCP,
                                message: '请选择检验员'
                            }],
                            initialValue: bcpInfo.m_strCheckerID
                        })(<Select
                            notFoundContent="暂无数据"
                            placeholder="请选择一位采集人员"
                            onChange={officerSelectChange}>
                            {bindOfficerSelect()}
                        </Select>)}
                    </Item>
                    <Item
                        style={{ flex: 1, display: !caseData.m_bIsGenerateBCP ? 'flex' : 'none' }}
                        label="采集人员"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('officerInput', {
                            rules: [{
                                required: !caseData.m_bIsGenerateBCP,
                                message: '请选择检验员'
                            }],
                            initialValue: bcpInfo.m_strCheckerName
                        })(<Input />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    {/* 生成BCP */}
                    <Item style={{ flex: 1, display: caseData.m_bIsGenerateBCP ? 'flex' : 'none', width: '0' }}
                        label="采集单位"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('unitList', {
                            rules: [{
                                required: caseData.m_bIsGenerateBCP,
                                message: '请选择检验单位'
                            }],
                            initialValue: bcpInfo.m_strCheckOrganizationID
                        })(<Select
                            showSearch={true}
                            placeholder={"输入单位名称进行查询"}
                            defaultActiveFirstOption={false}
                            notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            showArrow={false}
                            filterOption={false}
                            onSearch={selectSearch}
                            onChange={unitListChange}>
                            {bindUnitSelect()}
                        </Select>)}
                    </Item>
                    {/* 不生成BCP */}
                    <Item style={{ flex: 1, display: !caseData.m_bIsGenerateBCP ? 'flex' : 'none' }}
                        label="采集单位"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('unitInput', {
                            rules: [{
                                required: !caseData.m_bIsGenerateBCP,
                                message: '请输入采集单位'
                            }],
                            initialValue: bcpInfo.m_strCheckOrganizationName
                        })(<Input />)}
                    </Item>
                    {/* 生成BCP */}
                    <Item
                        style={{ flex: 1, display: caseData.m_bIsGenerateBCP ? 'flex' : 'none', width: '0' }}
                        label="目的检验单位"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('dstUnit', {
                            rules: [{
                                required: caseData.m_bIsGenerateBCP,
                                message: '请选择目的检验单位'
                            }],
                            initialValue: bcpInfo.m_strDstOrganizationID
                        })(<Select
                            showSearch={true}
                            placeholder={"输入单位名称进行查询"}
                            defaultActiveFirstOption={false}
                            notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            showArrow={false}
                            filterOption={false}
                            onSearch={selectSearch}
                            onChange={dstUnitChange}
                            style={{ width: '100%' }}>
                            {bindDstUnitSelect()}
                        </Select>)}
                    </Item>
                    {/* 不生成BCP */}
                    <Item
                        style={{ flex: 1, display: !caseData.m_bIsGenerateBCP ? 'flex' : 'none' }}
                        label="目的检验单位"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}>
                        {getFieldDecorator('dstUnitInput', {
                            rules: [{
                                required: !caseData.m_bIsGenerateBCP,
                                message: '请输入目的检验单位'
                            }],
                            initialValue: bcpInfo.m_strDstOrganizationName
                        })(<Input />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="证件类型"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateType', {
                            rules: [
                                { required: false }
                            ],
                            initialValue: helper.isNullOrUndefined(bcpInfo.m_strCertificateType) ? '111' : bcpInfo.m_strCertificateType
                        })(<Select>
                            {getOptions(certificateType)}
                        </Select>)}
                    </Item>
                    <Item
                        label="证件编号"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateCode', {
                            rules: [
                                {
                                    required: false,
                                    message: '请填写证件编号'
                                }
                            ],
                            initialValue: bcpInfo.m_strCertificateCode
                        })(<Input maxLength={100} />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="证件生效日期"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateEffectDate', {
                            rules: [
                                {
                                    required: false,
                                    message: '请填写证件生效日期'
                                }
                            ],
                            initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strCertificateEffectDate)
                                ? ''
                                : helper.parseDate(bcpInfo.m_strCertificateEffectDate!),
                        })(<DatePicker
                            style={{ width: '100%' }}
                            locale={locale} />)}
                    </Item>
                    <Item
                        label="证件失效日期"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateInvalidDate', {
                            rules: [
                                {
                                    required: false,
                                    message: '请填写证件失效日期'
                                }
                            ],
                            initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strCertificateInvalidDate)
                                ? ''
                                : helper.parseDate(bcpInfo.m_strCertificateInvalidDate!)
                        })(<DatePicker
                            style={{ width: '100%' }}
                            locale={locale} />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="证件签发机关"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('CertificateIssueUnit', {
                            rules: [
                                {
                                    required: false,
                                    message: '请填写证件签发机关'
                                }
                            ],
                            initialValue: bcpInfo.m_strCertificateIssueUnit
                        })(<Input maxLength={100} />)}
                    </Item>
                    <Item
                        label="证件头像"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('UserPhoto', {
                            rules: [
                                {
                                    required: false,
                                    message: '请填写证件头像'
                                }
                            ],
                            initialValue: bcpInfo.m_strUserPhoto
                        })(<Input
                            addonAfter={<Icon type="ellipsis" onClick={selectAvatarHandle} />}
                            readOnly={true}
                            onClick={selectAvatarHandle} />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="性别"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('SexCode', {
                            rules: [
                                { required: false }
                            ],
                            initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strSexCode) ? '0' : bcpInfo.m_strSexCode
                        })(<Select>
                            {getOptions(sexCode)}
                        </Select>)}
                    </Item>
                    <Item
                        label="民族"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('Nation', {
                            rules: [
                                { required: false }
                            ],
                            initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strNation) ? '1' : bcpInfo.m_strNation
                        })(<Select>
                            {getOptions(ethnicity)}
                        </Select>)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item
                        label="出生日期"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('Birthday', {
                            rules: [
                                {
                                    required: false,
                                    message: '请填写出生日期'
                                }
                            ],
                            initialValue: helper.isNullOrUndefinedOrEmptyString(bcpInfo.m_strBirthday)
                                ? ''
                                : helper.parseDate(bcpInfo.m_strBirthday!)
                        })(<DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(currentDate: Moment | null) => helper.isAfter(currentDate!)}
                            locale={locale} />)}
                    </Item>
                    <Item
                        label="住址"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        style={{ flex: 1 }}>
                        {getFieldDecorator('Address', {
                            rules: [
                                {
                                    required: false,
                                    message: '请填写住址'
                                }
                            ],
                            initialValue: bcpInfo.m_strAddress
                        })(<Input />)}
                    </Item>
                </div>
            </Form>
        </div>;
    }

    return <div className="bcp-input-modal-root">
        <Modal
            visible={props.visible}
            onOk={() => generateBcpClick()}
            onCancel={() => {
                const { dispatch } = props;
                unitSearched = false;
                dispatch({ type: 'bcpInputModal/resetBcpInfo' });
                props.cancelHandle();
            }}
            title="BCP信息录入"
            destroyOnClose={true}
            width={1000}
            okText="生成"
            cancelText="取消"
            okButtonProps={{ icon: 'file-sync' }}
            cancelButtonProps={{ icon: 'close-circle' }}>
            <div>
                {renderForm()}
            </div>
        </Modal>
    </div>;

};

export default connect((state: any) =>
    ({ bcpInputModal: state.bcpInputModal }))(Form.create({ name: 'bcpInput' })(BcpInputModal));
