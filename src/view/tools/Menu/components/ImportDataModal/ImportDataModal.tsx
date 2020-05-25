import { remote, OpenDialogReturnValue } from 'electron';
import React, { memo, FC, MouseEvent, useEffect, useState, useRef } from 'react';
import debounce from 'lodash/debounce';
import moment from 'moment';
import AutoComplete from 'antd/lib/auto-complete';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import { connect } from 'dva';
import { helper } from '@src/utils/helper';
import localStore from '@src/utils/localStore';
import { FormValue } from './FormValue';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import { FetchTypeNameItem } from '@src/schema/FetchTypeNameItem';
import { CImportDataInfo } from '@src/schema/CImportDataInfo';
import { Prop } from './ComponentTypes';
import { CBCPInfo } from '@src/schema/CBCPInfo';

const ImportDataModal: FC<Prop> = (props) => {

    const [historyCheckerNames, setHistoryCheckerNames] = useState<string[]>([]);
    const [dataPath, setDataPath] = useState<string>('');
    //*保存选中检验员的名字
    let officerSelectName = useRef('');
    //*保存选中检验员的编号
    let officerSelectID = useRef('');
    //*保存选中采集单位的名字
    let unitListName = useRef('');
    //*保存选中采集单位的id
    let unitListID = useRef('');
    //*选中的案件App列表
    let appList = useRef<string[]>([]);
    //*选中的案件送检单位
    let sendUnit = useRef('');
    //*是否自动解析
    let isAuto = useRef(false);
    //*是否生成BCP
    let isBcp = useRef(false);

    useEffect(() => {
        const { dispatch } = props;
        dispatch!({ type: 'importDataModal/queryCaseList' });
        dispatch!({ type: 'importDataModal/queryOfficerList' });
        dispatch!({ type: 'importDataModal/queryUnit' });
        dispatch!({ type: 'importDataModal/queryCollectTypeData' });
        let names: string[] = localStore.get('HISTORY_CHECKERNAME');
        setHistoryCheckerNames(names);
    }, []);

    /**
     * 绑定案件下拉数据
     */
    const bindCaseSelect = () => {
        const { caseList } = props.importDataModal!;
        const { Option } = Select;
        return caseList.map((opt: CCaseInfo) => {
            let pos = opt.m_strCaseName.lastIndexOf('\\');
            let [caseName, timestamp] = opt.m_strCaseName.substring(pos + 1).split('_');
            return <Option
                value={opt.m_strCaseName.substring(pos + 1)}
                data-bcp={opt.m_bIsGenerateBCP}
                data-app-list={opt.m_Applist}
                data-is-auto={opt.m_bIsAutoParse}
                data-send-unit={opt.m_strDstCheckUnitName}
                key={helper.getKey()}>
                {timestamp === undefined ? caseName : `${caseName}（${moment(timestamp, 'YYYYMMDDHHmmss').format('YYYY-M-D HH:mm:ss')}）`}
            </Option>
        });
    }

    /**
     * 绑定检验员下拉
     */
    const bindOfficerSelect = () => {
        // m_strCoronerName
        const { officerList } = props.importDataModal!;
        const { Option } = Select;
        return officerList.map((opt: CCheckerInfo) => {
            return <Option
                value={opt.m_strUUID}
                data-name={opt.m_strCheckerName}
                data-id={opt.m_strCheckerID}
                key={helper.getKey()}>
                {opt.m_strCheckerID ? `${opt.m_strCheckerName}（${opt.m_strCheckerID}）` : opt.m_strCheckerName}
            </Option>
        });
    }

    /**
     * 绑定采集方式下拉
     */
    const bindCollectType = () => {
        const { Option } = Select;
        const { collectTypeList } = props.importDataModal!;
        if (collectTypeList && collectTypeList.length > 0) {
            return collectTypeList.map<JSX.Element>((item: FetchTypeNameItem) => {
                return <Option
                    value={item.nFetchTypeID}
                    key={helper.getKey()}>
                    {item.m_strDes}
                </Option>;
            });
        } else {
            return [];
        }
    };

    /**
     * 绑定采集单位下拉
     */
    const bindUnitSelect = () => {
        const { unitList, unitCode, unitName } = props.importDataModal!;
        const { Option } = Select;
        let options = unitList.map((opt: CCheckOrganization) => {
            return <Option
                value={opt.m_strCheckOrganizationID}
                data-name={opt.m_strCheckOrganizationName}
                key={helper.getKey()}>
                {opt.m_strCheckOrganizationName}
            </Option>
        });
        if (!helper.isNullOrUndefined(unitCode) && unitList.find(item => item.m_strCheckOrganizationID === unitCode) === undefined) {
            options.push(<Option value={unitCode!} data-name={unitName}>
                {unitName}
            </Option>);
        }
        return options;
    };

    /**
     * 采集单位下拉Search事件
     */
    const unitListSearch = debounce((keyword: string) => {
        const { dispatch } = props;
        dispatch!({ type: 'importDataModal/queryUnitData', payload: keyword });
    }, 800);
    /**
     * 检验员下拉Change事件
     */
    const officerSelectChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
        const { props } = (opt as JSX.Element);
        officerSelectName.current = props['data-name'];
        officerSelectID.current = props['data-id'];
    }
    /**
     * 采集单位下拉Change事件
     */
    const unitListChange = (val: string, opt: JSX.Element | JSX.Element[]) => {
        const { children, value } = (opt as JSX.Element).props;
        unitListName.current = children;
        unitListID.current = value;
    }

    /**
     * 案件下拉Change
     */
    const caseChange = (value: string, option: JSX.Element | JSX.Element[]) => {
        let bcp = (option as JSX.Element).props['data-bcp'] as boolean;
        appList.current = (option as JSX.Element).props['data-app-list'] as Array<string>;
        isAuto.current = (option as JSX.Element).props['data-is-auto'] as boolean;
        sendUnit.current = (option as JSX.Element).props['data-send-unit'] as string;
        const { setFieldsValue } = props.form;
        const { unitName, unitCode } = props.importDataModal!;
        isBcp.current = bcp;

        if (bcp) {
            setFieldsValue({
                officerInput: '',
                unitInput: unitName
            });
        } else {
            setFieldsValue({
                officerSelect: null,
                unitList: unitCode
            });
        }
    }

    const selectDirHandle = (event: MouseEvent<HTMLInputElement>) => {
        const { setFieldsValue, resetFields } = props.form;
        remote.dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
            .then((val: OpenDialogReturnValue) => {
                resetFields(['dataPath']);
                if (val.filePaths && val.filePaths.length > 0) {
                    setFieldsValue({ casePath: val.filePaths[0] });
                    setDataPath(val.filePaths[0]);
                }
            });
    }

    /**
     * 关闭框清空属性
     */
    const resetFields = () => {
        officerSelectName.current = '';
        officerSelectID.current = '';
        unitListName.current = '';
        unitListID.current = '';
        appList.current = [];
        sendUnit.current = '';
        isAuto.current = false;
        isBcp.current = false;
        setDataPath('');
    }

    /**
     * 表单提交
     */
    const formSubmit = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const { validateFields } = props.form;
        validateFields((errors: any, values: FormValue) => {
            if (!errors) {
                let indata = new CImportDataInfo();
                indata.m_BaseInfo = new CFetchDataInfo(); //案件
                indata.m_BaseInfo.m_BCPInfo = new CBCPInfo();
                indata.m_BaseInfo.m_strCaseName = values.case;
                indata.m_BaseInfo.m_strDeviceName = `${values.name}_${helper.timestamp()}`;
                indata.m_BaseInfo.m_strDeviceNumber = values.deviceNumber;
                indata.m_BaseInfo.m_strDeviceHolder = values.user;
                // indata.m_BaseInfo.m_bIsGenerateBCP = isBcp;
                indata.m_BaseInfo.m_nFetchType = values.collectType;
                indata.m_strFileFolder = values.dataPath;
                indata.m_strPhoneBrand = values.brand;
                indata.m_strPhoneModel = values.piModel;
                if (isBcp.current) {
                    indata.m_BaseInfo.m_strThirdCheckerID = officerSelectID.current;
                    indata.m_BaseInfo.m_strThirdCheckerName = officerSelectName.current;
                    indata.m_BaseInfo.m_BCPInfo.m_strCheckOrganizationName = unitListName.current;
                    indata.m_BaseInfo.m_BCPInfo.m_strCheckOrganizationID = unitListID.current;
                } else {
                    indata.m_BaseInfo.m_strThirdCheckerName = values.officerInput;
                    indata.m_BaseInfo.m_strThirdCheckerID = '';
                    indata.m_BaseInfo.m_BCPInfo.m_strCheckOrganizationName = values.unitInput;
                    indata.m_BaseInfo.m_BCPInfo.m_strCheckOrganizationID = '';

                    let names: string[] = localStore.get('HISTORY_CHECKERNAME');
                    let nameSet = null;
                    if (helper.isNullOrUndefined(names)) {
                        nameSet = new Set([values.officerInput]);
                    } else {
                        nameSet = new Set([values.officerInput, ...names]);
                    }
                    localStore.set('HISTORY_CHECKERNAME', Array.from(nameSet));
                }
                props.saveHandle!(indata);
            }
        });
    }

    /**
     * 渲染表单
     */
    const renderForm = (): JSX.Element => {
        const { Item } = Form;
        const { getFieldDecorator } = props.form;
        const { unitCode, unitName, collectTypeList } = props.importDataModal!;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };

        return <Form layout="horizontal" {...formItemLayout}>
            <Item label="数据位置">
                {getFieldDecorator('dataPath', {
                    initialValue: dataPath,
                    rules: [{ required: true, message: '请选择第三方数据位置' }]
                })(<Input
                    addonAfter={<Icon type="ellipsis" onClick={selectDirHandle} />}
                    readOnly={true}
                    placeholder="第三方数据所在位置"
                    onClick={selectDirHandle} />
                )}
            </Item>
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
                <Item label="检验员" style={{
                    display: isBcp.current ? 'none' : 'block',
                    flex: 1
                }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                    {getFieldDecorator('officerInput', {
                        rules: [{
                            required: !isBcp.current,
                            message: '请填写检验员'
                        }]
                    })(<AutoComplete
                        placeholder="检验员姓名"
                        dataSource={helper.isNullOrUndefined(historyCheckerNames) ? [] : historyCheckerNames} />)}
                </Item>
                <Item label="采集单位" style={{
                    display: isBcp.current ? 'none' : 'block',
                    flex: 1
                }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                    {getFieldDecorator('unitInput', {
                        rules: [{
                            required: !isBcp.current,
                            message: '请填写采集单位'
                        }],
                        initialValue: unitName
                    })(<Input placeholder={"请填写采集单位"} />)}
                </Item>
            </div>
            <div style={{ display: 'flex' }}>
                <Item label="检验员" style={{
                    display: !isBcp.current ? 'none' : 'block',
                    flex: 1
                }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                    {getFieldDecorator('officerSelect', {
                        rules: [{
                            required: isBcp.current,
                            message: '请选择检验员'
                        }]
                    })(<Select
                        notFoundContent="暂无数据"
                        placeholder="请选择一位检验员"
                        onChange={officerSelectChange}>
                        {bindOfficerSelect()}
                    </Select>)}
                </Item>
                <Item label="采集单位" style={{
                    display: !isBcp.current ? 'none' : 'block',
                    flex: 1
                }} labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                    {getFieldDecorator('unitList', {
                        rules: [{
                            required: isBcp.current,
                            message: '请选择采集单位'
                        }], initialValue: unitCode
                    })(<Select
                        showSearch={true}
                        placeholder={"输入单位名称进行查询"}
                        defaultActiveFirstOption={false}
                        notFoundContent={<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                        showArrow={false}
                        filterOption={false}
                        onSearch={unitListSearch}
                        onChange={unitListChange}>
                        {bindUnitSelect()}
                    </Select>)}
                </Item>
            </div>
            <div style={{ display: 'flex' }}>
                <Item label="手机名称" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: '请填写手机名称'
                            }]
                        })(<Input maxLength={20} />)
                    }
                </Item>
                <Item label="手机持有人" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                    {
                        getFieldDecorator('user', {
                            rules: [{
                                required: true,
                                message: '请填写持有人'
                            }]
                        })(<Input placeholder="持有人姓名" maxLength={20} />)
                    }
                </Item>
            </div>
            <div style={{ display: 'flex' }}>
                <Item label="手机品牌" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                    {
                        getFieldDecorator('brand', {
                            initialValue: ''
                        })(<Input maxLength={20} />)
                    }
                </Item>
                <Item label="手机型号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                    {
                        getFieldDecorator('piModel', {
                            initialValue: ''
                        })(<Input maxLength={20} />)
                    }
                </Item>
            </div>
            <div style={{ display: 'flex' }}>
                <Item label="手机编号" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                    {
                        getFieldDecorator('deviceNumber', {
                            initialValue: ''
                        })(<Input maxLength={20} />)
                    }
                </Item>
                <Item label="采集方式" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} style={{ flex: 1 }}>
                    {
                        getFieldDecorator('collectType', {
                            initialValue: collectTypeList && collectTypeList.length > 0 ? collectTypeList[0].nFetchTypeID : ''
                        })(<Select
                            notFoundContent="暂无数据">
                            {bindCollectType()}
                        </Select>)
                    }
                </Item>
            </div>
        </Form>
    };

    return <div className="case-input-modal">
        <Modal
            width={800}
            visible={props.visible}
            title="导入信息录入"
            destroyOnClose={true}
            onCancel={() => {
                resetFields();
                props.cancelHandle!();
            }}
            afterClose={() => setDataPath('')}
            footer={[
                <Button
                    type="default"
                    icon="close-circle"
                    key={helper.getKey()}
                    onClick={() => props.cancelHandle!()}>
                    取消</Button>,
                <Button
                    type="primary"
                    icon="import"
                    onClick={formSubmit}>
                    导入</Button>
            ]}>
            <div>
                {renderForm()}
            </div>
        </Modal>
    </div>;
};


export default memo(connect((state: any) => {
    return {
        importDataModal: state.importDataModal
    }
})(Form.create({ name: 'importData' })(ImportDataModal)));