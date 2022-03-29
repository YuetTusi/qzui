import React, { useCallback, useState, MouseEvent } from 'react';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import { AllowCaseName } from '@src/utils/regex';
import throttle from 'lodash/throttle';
import { helper } from '@src/utils/helper';
import Icon from 'antd/lib/icon';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import AutoComplete from 'antd/lib/auto-complete';
import UserHistory, { HistoryKeys } from '@src/utils/userHistory';
import CCaseInfo, { CaseType } from '@src/schema/CCaseInfo';
import { CreateCheckModalProp, FormValue } from './prop';

const { Item } = Form;
const { Search } = Input;
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 }
};

const CreateCheckModal = Form.create<CreateCheckModalProp>()(({
    form,
    visible,
    saveHandle,
    cancelHandle
}: CreateCheckModalProp) => {
    const [isCheck, setIsCheck] = useState(false);
    const [historyUnitNames] = useState(UserHistory.get(HistoryKeys.HISTORY_UNITNAME));
    const { getFieldDecorator, setFieldsValue, validateFields } = form;

    /**
    * 验证案件重名
    */
    const validCaseNameExists = throttle((rule: any, value: string, callback: any) => {
        setIsCheck(true);
        let next = value === '..' ? '.' : value;
        helper
            .caseNameExist(next)
            .then(({ length }) => {
                if (length > 0) {
                    callback(new Error('案件名称已存在'));
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
     * 保存Click
     */
    const saveCaseClick = () => {
        validateFields((err: Error, values: FormValue) => {
            if (helper.isNullOrUndefined(err)) {
                let entity = new CCaseInfo();
                entity.caseType = CaseType.QuickCheck;
                entity.m_strCaseName = `${values.currentCaseName.replace(
                    /_/g,
                    ''
                )}_${helper.timestamp()}`;
                entity.m_strCasePath = values.m_strCasePath;
                entity.spareName = '';
                entity.m_strCheckUnitName = values.checkUnitName;
                entity.sdCard = false;
                entity.hasReport = false;
                entity.m_bIsAutoParse = true;
                entity.m_Applist = [];
                entity.tokenAppList = [];
                entity.generateBcp = false;
                entity.attachment = false;
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
                entity.aiThumbnail = false;
                entity.aiWeapon = false;
                entity.aiDoc = false;
                entity.aiDrug = false;
                entity.aiNude = false;
                entity.aiMoney = false;
                entity.aiDress = false;
                entity.aiTransport = false;
                entity.aiCredential = false;
                entity.aiTransfer = false;
                entity.aiScreenshot = false;
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
        width={800}
        centered={true}
        destroyOnClose={true}
        maskClosable={false}
        title="快速点验">
        <Form {...formItemLayout}>
            <Item label="案件名称">
                {getFieldDecorator('currentCaseName', {
                    rules: [
                        { required: true, message: '请填写案件名称' },
                        { pattern: AllowCaseName, message: '不允许输入非法字符' },
                        {
                            validator: validCaseNameExists,
                            message: '案件名称已存在'
                        }
                    ]
                })(<Search placeholder="请输入案件名称" maxLength={30} loading={isCheck} />)}
            </Item>
            <Item label="存储路径">
                {getFieldDecorator('m_strCasePath', {
                    rules: [
                        {
                            required: true,
                            message: '请选择存储路径'
                        }
                    ]
                })(
                    <Input
                        addonAfter={
                            <Icon type="ellipsis" onClick={selectDirHandle} />
                        }
                        placeholder="请选择存储路径"
                        readOnly={true}
                        onClick={selectDirHandle}
                    />
                )}
            </Item>
            <Item label="检验单位">
                {getFieldDecorator('checkUnitName', {
                    rules: [{ required: true, message: '请填写检验单位' }],
                    initialValue:
                        helper.isNullOrUndefined(historyUnitNames) ||
                            historyUnitNames.length === 0
                            ? ''
                            : historyUnitNames[0]
                })(
                    <AutoComplete
                        dataSource={
                            helper.isNullOrUndefined(historyUnitNames)
                                ? []
                                : historyUnitNames.reduce(
                                    (
                                        total: string[],
                                        current: string,
                                        index: number
                                    ) => {
                                        if (
                                            index < 10 &&
                                            !helper.isNullOrUndefinedOrEmptyString(
                                                current
                                            )
                                        ) {
                                            total.push(current);
                                        }
                                        return total;
                                    },
                                    []
                                )
                        }
                    />
                )}
            </Item>
        </Form>
    </Modal>
});

export default CreateCheckModal;