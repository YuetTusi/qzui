import React, { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { remote, OpenDialogReturnValue } from 'electron';
import { connect } from 'dva';
import { Moment } from 'moment';
import Button from 'antd/lib/button';
import AutoComplete from 'antd/lib/auto-complete';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Form from 'antd/lib/form';
import Collapse from 'antd/lib/collapse';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import { helper } from '@src/utils/helper';
import { Prop, FormValue } from './componentTypes';
import UserHistory, { HistoryKeys } from '@src/utils/userHistory';
import CCaseInfo from '@src/schema/CCaseInfo';
import { certificateType } from '@src/schema/CertificateType';
import { ethnicity } from '@src/schema/Ethnicity';
import { sexCode } from '@src/schema/SexCode';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import { CBCPInfo } from '@src/schema/CBCPInfo';
import './CaseInputModal.less';

const CaseInputModal: FC<Prop> = (props) => {

    useEffect(() => {
        props.dispatch({ type: 'caseInputModal/queryCaseList' });
    }, []);

    const [isBcp, setIsBcp] = useState<boolean>(false); //当前下拉案件是否是BCP

    const historyCheckerNames = useRef(UserHistory.get(HistoryKeys.HISTORY_CHECKERNAME));
    const historyCheckerNo = useRef(UserHistory.get(HistoryKeys.HISTORY_CHECKERNO));
    const historyDeviceName = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENAME));
    const historyDeviceHolder = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICEHOLDER));
    const historyDeviceNumber = useRef(UserHistory.get(HistoryKeys.HISTORY_DEVICENUMBER));

    const casePath = useRef<string>('');    //案件存储路径
    const appList = useRef<string[]>([]);      //解析App
    const isAuto = useRef<boolean>(false);  //是否自动解析
    const sendUnit = useRef<string>('');    //送检单位

    /**
     * 绑定案件下拉数据
     */
    const bindCaseSelect = () => {
        const { caseList } = props.caseInputModal!;
        const { Option } = Select;
        return caseList.map((opt: CCaseInfo) => {
            let pos = opt.m_strCaseName.lastIndexOf('\\');
            let [name, tick] = opt.m_strCaseName.substring(pos + 1).split('_');
            return <Option
                value={opt.m_strCaseName.substring(pos + 1)}
                data-case-path={opt.m_strCasePath}
                data-bcp={opt.m_bIsGenerateBCP}
                data-app-list={opt.m_Applist}
                data-is-auto={opt.m_bIsAutoParse}
                data-send-unit={opt.m_strDstCheckUnitName}
                key={helper.getKey()}>
                {`${name}（${helper.parseDate(tick, 'YYYYMMDDHHmmss').format('YYYY-M-D H:mm:ss')}）`}
            </Option>
        });
    }

    /**
     * 案件下拉Change
     */
    const caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
        let isBcp = (option as JSX.Element).props['data-bcp'] as boolean;
        casePath.current = (option as JSX.Element).props['data-case-path'] as string;
        appList.current = (option as JSX.Element).props['data-app-list'] as Array<string>;
        isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
        sendUnit.current = (option as JSX.Element).props['data-send-unit'] as string;

        const { setFieldsValue, validateFields } = props.form;

        setIsBcp(isBcp);

        //# 当用户切换了案件，强制较验相关字段 
        validateFields([
            'm_strThirdCheckerName', 'officerSelect',
            'phoneName', 'user'],
            { force: true });

        if (isBcp) {
            setFieldsValue({
                officerInput: ''
            });
        } else {
            setFieldsValue({
                officerSelect: null
            });
        }

        // this.setState({
        //     isBcp,
        //     isOpenBcpPanel: isBcp
        // }, () => validateFields([
        //     'm_strThirdCheckerName', 'officerSelect',
        //     'phoneName', 'user'],
        //     { force: true }));

    }

    /**
    * 将JSON数据转为Options元素
    * @param data JSON数据
    */
    const getOptions = (data: Record<string, any>[]): JSX.Element[] => {
        const { Option } = Select;
        return data.map<JSX.Element>((item: Record<string, any>) =>
            <Option value={item.value} key={helper.getKey()}>{item.name}</Option>);
    }

    /**
     * 选择头像路径Handle
     */
    const selectAvatarHandle = (event: MouseEvent<HTMLInputElement>) => {
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
    }

    /**
     * 表单提交
     */
    const formSubmit = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const { validateFields } = props.form;
        const {
            // piUserlist,
            saveHandle
        } = props;
        //const { unitName, unitCode, dstUnitName, dstUnitCode } = props.caseInputModal!;
        validateFields((errors: any, values: FormValue) => {
            if (!errors) {
                let caseEntity = new CFetchDataInfo();//案件
                caseEntity.m_strCaseName = values.case;
                //TODO:此处赋值案件存储路径 casePath.current
                console.log(casePath.current);
                caseEntity.m_strThirdCheckerID = values.m_strThirdCheckerID;
                caseEntity.m_strThirdCheckerName = values.m_strThirdCheckerName;
                // caseEntity.m_strDeviceID = piSerialNumber + piLocationID;
                caseEntity.m_strDeviceName = `${values.phoneName}_${helper.timestamp()}`;
                caseEntity.m_strDeviceNumber = values.deviceNumber;
                caseEntity.m_strDeviceHolder = values.user;
                caseEntity.m_nFetchType = values.collectType;

                let bcpEntity = new CBCPInfo();
                if (isBcp) {
                    //*生成BCP
                    // bcpEntity.m_strCheckerID = this.officerSelectID;
                    // bcpEntity.m_strCheckerName = this.officerSelectName;
                    // bcpEntity.m_strCheckOrganizationID = unitCode!;
                    // bcpEntity.m_strCheckOrganizationName = unitName!;
                    // bcpEntity.m_strDstOrganizationID = dstUnitCode!;
                    // bcpEntity.m_strDstOrganizationName = dstUnitName!;
                } else {
                    //*不生成BCP
                    // bcpEntity.m_strCheckerID = '';
                    // bcpEntity.m_strCheckerName = values.officerInput;
                    // bcpEntity.m_strCheckOrganizationID = '';
                    // bcpEntity.m_strCheckOrganizationName = unitName!;
                    // bcpEntity.m_strDstOrganizationID = '';
                    // bcpEntity.m_strDstOrganizationName = dstUnitName!;
                }
                bcpEntity.m_strCertificateType = values.CertificateType;
                bcpEntity.m_strCertificateCode = values.CertificateCode;
                bcpEntity.m_strCertificateIssueUnit = values.CertificateIssueUnit;
                bcpEntity.m_strCertificateEffectDate = helper.isNullOrUndefined(values.CertificateEffectDate) ? '' : values.CertificateEffectDate.format('YYYY-MM-DD');
                bcpEntity.m_strCertificateInvalidDate = helper.isNullOrUndefined(values.CertificateInvalidDate) ? '' : values.CertificateInvalidDate.format('YYYY-MM-DD');
                bcpEntity.m_strSexCode = values.SexCode;
                bcpEntity.m_strNation = values.Nation;
                bcpEntity.m_strBirthday = helper.isNullOrUndefined(values.Birthday) ? '' : values.Birthday.format('YYYY-MM-DD');
                bcpEntity.m_strAddress = values.Address;
                bcpEntity.m_strUserPhoto = values.UserPhoto;
                caseEntity.m_BCPInfo = bcpEntity;

                saveHandle!(caseEntity);

                // if (caseEntity.m_nFetchType === AppDataExtractType.ANDROID_DOWNGRADE_BACKUP) {
                //     //# 采集方式为`降级备份`给用户弹提示
                //     Modal.confirm({
                //         title: '风险警示',
                //         content: '降级备份可能造成数据损坏，确认使用？',
                //         okText: '继续',
                //         cancelText: '取消',
                //         iconType: 'warning',
                //         onOk() {
                //             saveHandle!(caseEntity);
                //         }
                //     });
                // } else if (piUserlist && piUserlist.length === 1) {
                //     //# 如果采集的设备有`多用户`或`隐私空间`等情况，要给用户弹出提示
                //     Modal.confirm({
                //         title: '请确认',
                //         content: confirmText(piUserlist[0]),
                //         okText: '开始取证',
                //         cancelText: '取消',
                //         onOk() {
                //             saveHandle!(caseEntity);
                //         }
                //     });
                // } else if (piUserlist && piUserlist.length === 2) {
                //     Modal.confirm({
                //         title: '请确认',
                //         content: confirmText(-1),
                //         okText: '开始取证',
                //         cancelText: '取消',
                //         onOk() {
                //             saveHandle!(caseEntity);
                //         }
                //     });
                // } else {
                //     saveHandle!(caseEntity);
                // }
            }
        });
    }

    const renderForm = (): JSX.Element => {
        const { Item } = Form;
        const { Panel } = Collapse;
        const { getFieldDecorator } = props.form;

        // const { collectTypeList } = props.caseInputModal;
        // const { isBcp } = state;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };

        return <div>
            <Form layout="horizontal" {...formItemLayout}>
                <Item label="案件名称">
                    {getFieldDecorator('case', {
                        rules: [{
                            required: true,
                            message: '请选择案件'
                        }]
                    })(<Select
                        notFoundContent="暂无数据"
                        placeholder="选择一个案件"
                        onChange={caseChange}>
                        {bindCaseSelect()}
                    </Select>)}
                </Item>
                <div style={{ display: 'flex' }}>
                    <Item label="检验员" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {getFieldDecorator('m_strThirdCheckerName', {
                            rules: [{ required: true, message: '请填写检验员' }]
                        })(<AutoComplete dataSource={historyCheckerNames.current.reduce((total: string[], current: string, index: number) => {
                            if (index < 10 && current !== null) {
                                total.push(current);
                            }
                            return total;
                        }, [])} />)}
                    </Item>
                    <Item label="检验员编号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {getFieldDecorator('m_strThirdCheckerID')(<AutoComplete
                            dataSource={historyCheckerNo.current.reduce((total: string[], current: string, index: number) => {
                                if (index < 10 && current !== null) {
                                    total.push(current);
                                }
                                return total;
                            }, [])} />)}
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('phoneName', {
                                rules: [{
                                    required: true,
                                    message: '请填写手机名称'
                                }],
                                initialValue: props.device?.model,
                            })(<AutoComplete
                                dataSource={historyDeviceName.current.reduce((total: string[], current: string, index: number) => {
                                    if (index < 10 && current !== null) {
                                        total.push(current);
                                    }
                                    return total;
                                }, [])} />)
                        }
                    </Item>
                    <Item label="手机持有人" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('user', {
                                rules: [{
                                    required: true,
                                    message: '请填写持有人'
                                }]
                            })(<AutoComplete
                                dataSource={historyDeviceHolder.current.reduce((total: string[], current: string, index: number) => {
                                    if (index < 10 && current !== null) {
                                        total.push(current);
                                    }
                                    return total;
                                }, [])} />)
                        }
                    </Item>
                </div>
                <div style={{ display: 'flex' }}>
                    <Item label="手机编号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('deviceNumber')(<AutoComplete
                                dataSource={historyDeviceNumber.current.reduce((total: string[], current: string, index: number) => {
                                    if (index < 10 && current !== null) {
                                        total.push(current);
                                    }
                                    return total;
                                }, [])} />)
                        }
                    </Item>
                    <Item label="采集方式" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                        {
                            getFieldDecorator('collectType', {
                                initialValue: ''
                            })(<Select notFoundContent="暂无数据">
                                {/*// TODO:在这里绑定采集方式 */}
                                {/* {context.bindCollectType()} */}
                            </Select>)
                        }
                    </Item>
                </div>
                {/*暂时不用动态展开面板  activeKey={this.state.isOpenBcpPanel ? '1' : '0'} */}
                <Collapse activeKey={isBcp ? '1' : '0'} onChange={() => setIsBcp((prev) => !prev)}>
                    <Panel header="BCP采集信息录入" key="1">

                        <div style={{ display: 'flex' }}>
                            <Tooltip title="采集单位民警编号">
                                <Item label="采集人员" style={{ display: isBcp ? 'none' : 'flex', flex: 1 }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                                    {getFieldDecorator('officerInput', {
                                        rules: [{
                                            required: false,
                                            message: '请填写采集人员'
                                        }]
                                    })(<Input />)}
                                </Item>
                            </Tooltip>
                            <Item label="采集人员" style={{ display: !isBcp ? 'none' : 'flex', flex: 1 }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                                {getFieldDecorator('officerSelect', {
                                    rules: [{
                                        required: isBcp,
                                        message: '请选择采集人员'
                                    }]
                                })(<Select
                                    notFoundContent="暂无数据"
                                    placeholder="请选择一位采集人员">
                                    {/* onChange={context.officerSelectChange}> */}
                                    {/* {context.bindOfficerSelect()} */}
                                </Select>)}
                            </Item>
                            <Item
                                label="出生日期"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('Birthday', {
                                    rules: [
                                        {
                                            required: false,
                                            message: '请填写出生日期'
                                        }
                                    ]
                                })(<DatePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(currentDate: Moment | null) => helper.isAfter(currentDate!)}
                                    locale={locale} />)}
                            </Item>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <Item
                                label="证件类型"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('CertificateType', {
                                    rules: [
                                        { required: false }
                                    ],
                                    initialValue: '111'
                                })(<Select>
                                    {getOptions(certificateType)}
                                </Select>)}
                            </Item>
                            <Item
                                label="证件编号"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('CertificateCode', {
                                    rules: [
                                        {
                                            required: false,
                                            message: '请填写证件编号'
                                        }
                                    ]
                                })(<Input />)}
                            </Item>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <Item
                                label="证件生效日期"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('CertificateEffectDate', {
                                    rules: [
                                        {
                                            required: false,
                                            message: '请填写证件生效日期'
                                        }
                                    ]
                                })(<DatePicker
                                    style={{ width: '100%' }}
                                    locale={locale} />)}
                            </Item>
                            <Item
                                label="证件失效日期"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('CertificateInvalidDate', {
                                    rules: [
                                        {
                                            required: false,
                                            message: '请填写证件失效日期'
                                        }
                                    ]
                                })(<DatePicker
                                    style={{ width: '100%' }}
                                    locale={locale} />)}
                            </Item>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <Item
                                label="证件签发机关"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('CertificateIssueUnit', {
                                    rules: [
                                        {
                                            required: false,
                                            message: '请填写证件签发机关'
                                        }
                                    ]
                                })(<Input />)}
                            </Item>
                            <Item
                                label="性别"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('SexCode', {
                                    rules: [
                                        { required: false }
                                    ],
                                    initialValue: '0'
                                })(<Select>
                                    {getOptions(sexCode)}
                                </Select>)}
                            </Item>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <Item
                                label="民族"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('Nation', {
                                    rules: [
                                        { required: false }
                                    ],
                                    initialValue: '1'
                                })(<Select>
                                    {getOptions(ethnicity)}
                                </Select>)}
                            </Item>
                            <Item
                                label="证件头像"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ flex: 1 }}>
                                {getFieldDecorator('UserPhoto', {
                                    rules: [
                                        {
                                            required: false,
                                            message: '请选择证件头像'
                                        }
                                    ]
                                })(<Input
                                    addonAfter={<Icon type="ellipsis" onClick={selectAvatarHandle} />}
                                    readOnly={true}
                                    onClick={selectAvatarHandle} />)}
                            </Item>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <Item
                                label="住址"
                                style={{ flex: 1 }}>
                                {getFieldDecorator('Address', {
                                    rules: [
                                        {
                                            required: false,
                                            message: '请填写住址'
                                        }
                                    ]
                                })(<Input />)}
                            </Item>
                        </div>
                    </Panel>
                </Collapse>
            </Form>
        </div>;
    };

    return <div className="case-input-modal-root">
        <Modal
            width={1200}
            style={{ top: 20 }}
            visible={props.visible}
            title="取证信息录入"
            destroyOnClose={true}
            className="modal-style-update"
            onCancel={() => {
                // this.resetFields();
                props.cancelHandle!();
            }}
            footer={[
                <Button
                    type="default"
                    icon="close-circle"
                    key={helper.getKey()}
                    onClick={() => {
                        // this.resetFields();
                        props.cancelHandle!();
                    }}>
                    取消
                </Button>,
                <Tooltip title="点击确定后开始采集数据" key={helper.getKey()}>
                    <Button
                        type="primary"
                        icon="check-circle"
                        onClick={formSubmit}>
                        确定</Button>
                </Tooltip>
            ]}>
            <div>
                {renderForm()}
            </div>
        </Modal>
    </div>;
}
CaseInputModal.defaultProps = {
    visible: false,
    saveHandle: () => { },
    cancelHandle: () => { }
};

const ExtendCaseInputModal = Form.create({ name: 'caseForm' })(CaseInputModal);
export default connect((state: any) => ({ caseInputModal: state.caseInputModal }))(ExtendCaseInputModal);
