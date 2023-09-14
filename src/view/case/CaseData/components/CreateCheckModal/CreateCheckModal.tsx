import React, { useEffect, useCallback, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Tooltip from 'antd/lib/tooltip';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { StateTree } from '@src/type/model';
import { AllowCaseName } from '@src/utils/regex';
import throttle from 'lodash/throttle';
import { helper } from '@src/utils/helper';
import Icon from 'antd/lib/icon';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import CCaseInfo, { CaseType } from '@src/schema/CCaseInfo';
import { AttachmentType } from '@src/schema/socket/BcpEntity';
import AISwitch from '../../../AISwitch';
import { CreateCheckModalProp, FormValue } from './prop';
import './CreateCheckModal.less';

const { caseText } = helper.readConf();
const { Item } = Form;
const { Search, } = Input;
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 }
};

/**
 * 创建快速点验案件框
 * * 此处创建的案件caseType==1
 */
const CreateCheckModal = Form.create<CreateCheckModalProp>()(({
    dispatch,
    caseEdit,
    form,
    visible,
    caseId,
    saveHandle,
    cancelHandle
}: CreateCheckModalProp) => {
    const [isCheck, setIsCheck] = useState(false);
    // const [historyUnitNames] = useState(UserHistory.get(HistoryKeys.HISTORY_UNITNAME));
    const { getFieldDecorator, setFieldsValue, validateFields } = form;

    useEffect(() => {
        if (visible && caseId) {
            dispatch!({ type: 'caseEdit/queryCaseById', payload: caseId });
            dispatch!({ type: 'aiSwitch/readAiConfigByCaseId', payload: caseId });
        } else {
            dispatch!({ type: 'aiSwitch/readAiConfig', payload: { casePath: undefined } });
        }
    }, [visible, caseId]);

    /**
    * 验证案件重名
    */
    const validCaseNameExists = throttle((_: any, value: string, callback: any) => {
        setIsCheck(true);
        let next = value === '..' ? '.' : value;
        helper
            .caseNameExist(next)
            .then(({ length }) => {
                if (length > 0) {
                    callback(new Error(`${caseText ?? '案件'}名称已存在`));
                } else {
                    callback();
                }
                setIsCheck(false);
            })
            .catch((e) => {
                callback();
                setIsCheck(false);
            });
    }, 400);

    /**
    * 选择案件路径Handle
    */
    const selectDirHandle = useCallback((event: MouseEvent<HTMLInputElement>) => {
        ipcRenderer
            .invoke('open-dialog', {
                properties: ['openDirectory']
            })
            .then((val: OpenDialogReturnValue) => {
                if (val.filePaths && val.filePaths.length > 0) {
                    setFieldsValue({ m_strCasePath: val.filePaths[0] });
                }
            });
    }, []);

    /**
     * 违规终止时段校验
     */
    const compareRuleFrom = (rule: any, value: any, callback: (msg?: string) => void) => {
        const { getFieldValue } = form;
        if (value && value === getFieldValue('ruleFrom')) {
            callback('不要等于起始时段');
        } else {
            callback();
        }
    };

    /**
     * 保存Click
     */
    const saveCaseClick = () => {
        validateFields((err: Error, values: FormValue) => {
            if (helper.isNullOrUndefined(err)) {
                let entity = new CCaseInfo();
                entity._id = caseId;
                entity.caseType = CaseType.QuickCheck;
                if (caseId) {
                    //编辑使用原案件名称
                    entity.m_strCaseName = caseEdit?.data.m_strCaseName!;
                } else {
                    entity.m_strCaseName = `${values.currentCaseName.replace(
                        /_/g,
                        ''
                    )}_${helper.timestamp()}`;
                }
                entity.m_strCasePath = values.m_strCasePath;
                entity.spareName = '';
                entity.m_strCheckUnitName = values.checkUnitName;
                entity.ruleFrom = values.ruleFrom;
                entity.ruleTo = values.ruleTo;
                entity.sdCard = false;
                entity.hasReport = true;
                entity.m_bIsAutoParse = true;
                entity.m_Applist = [];
                entity.tokenAppList = [];
                entity.generateBcp = false;
                entity.attachment = AttachmentType.Nothing;
                entity.isDel = false;
                entity.officerNo = '';
                entity.officerName = '';
                entity.securityCaseNo = '';
                entity.securityCaseType = '';
                entity.securityCaseName = '';
                entity.handleCaseNo = '';
                entity.handleCaseType = '';
                entity.handleCaseName = '';
                entity.isAi = false;
                saveHandle(entity);
            }
        });
    };

    return <Modal
        footer={[
            <Button
                onClick={cancelHandle}
                icon="close-circle"
                type="default"
                key="B_0">取消</Button>,
            <Button
                onClick={saveCaseClick}
                type="primary"
                icon="check-circle"
                key="B_1">确定</Button>
        ]}
        visible={visible}
        onCancel={cancelHandle}
        width={1080}
        centered={true}
        destroyOnClose={true}
        maskClosable={false}
        className='create-check-modal-root'
        title={caseId === undefined ? '创建快速点验' : '编辑快速点验'}>
        <Form {...formItemLayout} style={{ marginTop: '20px' }}>
            <Item label={`${caseText ?? '案件'}名称`}>
                {getFieldDecorator('currentCaseName', {
                    rules: caseId === undefined ? [
                        { required: true, message: `请填写${caseText ?? '案件'}名称` },
                        { pattern: AllowCaseName, message: '不允许输入非法字符' },
                        {
                            validator: validCaseNameExists,
                            message: `${caseText ?? '案件'}名称已存在`
                        }
                    ] : undefined,
                    initialValue: helper.isNullOrUndefined(caseEdit?.data.m_strCaseName) ? '' : caseEdit!.data.m_strCaseName.split('_')[0]
                })(<Search disabled={caseId !== undefined} maxLength={30} loading={isCheck} placeholder={`请输入${caseText ?? '案件'}名称`} />)}
            </Item>
            <Item label="存储路径">
                {getFieldDecorator('m_strCasePath', {
                    rules: [
                        {
                            required: true,
                            message: '请选择存储路径'
                        }
                    ],
                    initialValue: caseEdit?.data.m_strCasePath
                })(
                    <Input
                        addonAfter={
                            caseId === undefined ? <Icon type="ellipsis" onClick={selectDirHandle} /> : null
                        }
                        placeholder="请选择存储路径"
                        readOnly={true}
                        disabled={caseId !== undefined}
                        onClick={selectDirHandle}
                    />
                )}
            </Item>
            <Row>
                <Col span={12}>
                    <Tooltip title="请填写0~24小时之间数值">
                        <Item label="违规时段 起" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                            {getFieldDecorator('ruleFrom', {
                                rules: [{ required: true, message: '请填写时段' }],
                                initialValue: caseId === undefined ? 0 : caseEdit?.data.ruleFrom
                            })(<InputNumber min={0} max={24} style={{ width: '100%' }} />)}
                        </Item>
                    </Tooltip>

                </Col>
                <Col span={12}>
                    <Tooltip title="请填写0~24小时之间数值">
                        <Item label="违规时段 止" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}>
                            {getFieldDecorator('ruleTo', {
                                rules: [
                                    { required: true, message: '请填写时段' },
                                    { validator: compareRuleFrom }
                                ],
                                initialValue: caseId === undefined ? 8 : caseEdit?.data.ruleTo
                            })(<InputNumber min={0} max={24} style={{ width: '100%' }} />)}
                        </Item>
                    </Tooltip>
                </Col>
            </Row>
            <div className="bcp-list">
                <div className="bcp-list-bar">
                    <Icon type="appstore" rotate={45} />
                    <span>AI信息</span>
                </div>
                <Row>
                    <Col span={2} />
                    <Col span={20}><AISwitch /></Col>
                    <Col span={2} />
                </Row>
            </div>
        </Form>
    </Modal>
});

export default connect((state: StateTree) => ({ caseEdit: state.caseEdit }))(CreateCheckModal);